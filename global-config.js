var globalConfig = {
  twitchChannel: "",
  /** List of twitch usernames who can invoke the bot.
   *  Note: "usernames" may differ from "display names". Use the username
   */
  twitchBotModerators: [""],
  /** _Not needed for a read-only bot_. For bots _writing_ to Twitch chat only.
   * The user this chatbot will use to send messages to Twitch chat.
   */
  twitchIdentity: {
    username: "", // leave empty for read-only mode
    password: "", // leave empty for read-only mode
  },

  /** Your Trello App Key for the board. */
  appKey: "",
  /** Your Trello User Token (ideally never expires) */
  apiToken: "",
  /** Trello Board's todo list. The list's name can be arbitrary. Only the id is important. */
  todoListId: "",
  /** Trello Board's doing list. The list's name can be arbitrary. Only the id is important. */
  doingListId: "",
  /** Trello Board's done list. The list's name can be arbitrary. Only the id is important. */
  doneListId: "",
};
