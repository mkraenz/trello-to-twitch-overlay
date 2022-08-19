// uses globals: tmi, Fuse, globalConfig loaded via index.html

const cfg = globalConfig; // set in global-config.js as a `var`

/** @typedef {{id: string; name: string;}} Card */

const keyAndToken = `key=${cfg.appKey}&token=${cfg.apiToken}`;
const maybeTwitchWriteIdentity =
  cfg.twitchIdentity.username && cfg.twitchIdentity.password
    ? cfg.twitchIdentity
    : undefined;

const TrelloApi = {
  /** @param {string} name */
  createCard: async (name) => {
    const newCard = {
      name,
      idList: cfg.todoListId,
      pos: "top",
    };
    const res = await fetch(`https://api.trello.com/1/cards/?${keyAndToken}`, {
      method: "POST",
      body: JSON.stringify(newCard),
      headers: { "Content-Type": "application/json" },
    });
    /** @type {Card} */
    const card = await res.json();
    console.log(card);
    return card;
  },
  /** @param {string} listId */
  getCardsInList: async (listId) => {
    const res = await fetch(
      `https://api.trello.com/1/lists/${listId}/cards?${keyAndToken}`
    );
    /** @type { Card[] } */
    const cards = await res.json();
    console.log(`cards in ${listId}`, cards);
    return cards;
  },
  /**
   * @param {string} cardId
   * @param {string} listId
   */
  moveCard: async (cardId, listId) => {
    const res = await fetch(
      `https://api.trello.com/1/cards/${cardId}?${keyAndToken}&idList=${listId}`,
      { method: "PUT" }
    );
    /** @type { Card[] } */
    const cards = await res.json();
    console.log(cards);
    return cards;
  },
};

/**
 * @param {string} text
 * @param {'todo' | 'doing' | 'done'} type
 */
const getListItem = (text, type = "todo") => {
  const item = document.createElement("li");
  item.innerHTML = text;
  if (type === "todo") item.className = "";
  if (type === "doing") item.className = "doing";
  if (type === "done") item.className = "done";
  return item;
};

const listNode = document.querySelector("#card-list");
/** @param {{todos: Card[]; doings: Card[]; done: Card[]}} state */
const render = (state) => {
  const existingNodes = listNode.querySelectorAll("li");
  for (const node of existingNodes) node.remove();
  const todoNodes = state.todos.map((card) => getListItem(card.name));
  const doingNodes = state.doings.map((card) =>
    getListItem(card.name, "doing")
  );
  const doneNodes = state.done.map((card) => getListItem(card.name, "done"));
  listNode.append(...doingNodes, ...todoNodes, ...doneNodes);
};

const main = async () => {
  const state = {
    /** @type {Card[]}*/ todos: [],
    /** @type {Card[]}*/ doings: [],
    /** @type {Card[]}*/ done: [],
  };
  const populateState = async () => {
    state.todos = await TrelloApi.getCardsInList(cfg.todoListId);
    state.doings = await TrelloApi.getCardsInList(cfg.doingListId);
    state.done = await TrelloApi.getCardsInList(cfg.doneListId);
  };

  const client = new tmi.Client({
    options: { debug: true },
    connection: { reconnect: true },
    channels: [cfg.twitchChannel],
    identity: maybeTwitchWriteIdentity,
  });

  client.connect();
  await populateState();
  render(state);
  window.setInterval(async () => {
    await populateState();
    render(state);
  }, 60000)

  const say = (text) => {
    console.log(text);
    const channel = cfg.twitchChannel;
    if (maybeTwitchWriteIdentity) client.say(channel, text);
  };

  client.on(
    "message",
    async (channel, tags, /** @type {string} */ msg, self) => {
      const username = tags.username;
      const canUseBot = cfg.twitchBotModerators.includes(username);
      const isCommand = msg.startsWith("!");

      // Ignore echoed messages, non-command messages, and messages from non-moderators
      if (self || !isCommand || !canUseBot) return;

      if (/^!refreshtodos/.test(msg)) await populateState();

      if (/^!todo/.test(msg)) {
        const [addTodoCmd, ...nameWords] = msg.split(" ");
        const createdCard = await TrelloApi.createCard(nameWords.join(" "));
        state.todos.push(createdCard);
      }

      if (/^!doing/.test(msg)) {
        const [moveToDoingCmd, ...nameWords] = msg.split(" ");
        const searchTerm = nameWords.join(" ");
        const options = {
          keys: ["name"],
        };
        const fuse = new Fuse(state.todos, options);
        /** @type {{item: Card}[]} */
        const searchResults = fuse.search(searchTerm);
        const bestMatchingCard = searchResults[0];
        if (bestMatchingCard) {
          await TrelloApi.moveCard(bestMatchingCard.item.id, cfg.doingListId);
          state.doings.push(bestMatchingCard.item);
          state.todos = state.todos.filter(
            (card) => card.id !== bestMatchingCard.item.id
          );
        } else say(`No results found for "${searchTerm}"`);
      }

      if (/^!done/.test(msg)) {
        const [moveToDoneCmd, ...nameWords] = msg.split(" ");
        const searchTerm = nameWords.join(" ");
        const options = {
          keys: ["name"],
        };
        const fuse = new Fuse(state.doings, options);
        /** @type {{item: Card}[]} */
        const searchResults = fuse.search(searchTerm);
        const bestMatchingCard = searchResults[0];
        if (bestMatchingCard) {
          await TrelloApi.moveCard(bestMatchingCard.item.id, cfg.doneListId);
          state.done.push(bestMatchingCard.item);
          state.doings = state.doings.filter(
            (cards) => cards.id !== bestMatchingCard.item.id
          );
        } else say(`No results found for "${searchTerm}"`);
      }

      if (/^!archivedone/.test(msg)) {
        for (const card of state.done) {
          await TrelloApi.moveCard(card.id, cfg.archiveListId);
        }
        state.done = [];
      }

      render(state);
    }
  );
};

main();
