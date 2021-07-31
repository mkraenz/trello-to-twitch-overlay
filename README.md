# Trello to Twitch Todo List Overlay

Show your Trello board's todo, doing, done list as an Overlay on your Twitch stream. Add and move cards via Twitch chat commands.

Designed for Open Broadcaster Studio (OBS) Browser Overlay. Works in any modern browser.

## Twitch Chat Commands

### Cheatsheet

```bash
!todo refactor main game loop
!doing loop
!done main
!refreshtodos
```

### In Detail

```bash
# Create Card in Todo list
!todo <card name>
# example: Create card `refactor main game loop`
!todo refactor main game loop


# Move card from Todo list to Doing list
!doing <search keyword>
# example: moves card `refactor main game loop` to Doing list
!doing loop

# Move card from Doing list to Done list
!done <search keyword>
# example: moves card `refactor main game loop` to Done list
!done main

# refetch all cards from Trello and re-render. Use if you make changes in Trello directly
!refreshtodos
```

## Initial Setup

- create a Trello Board or use an existing one
- if not already existent, Add 3 lists to the board: Todo, Doing, Done
  - Pro tip: the list names don't matter. All you need is 3 list IDs. You can also have more lists in the board but you need at least 3.
- create Trello App and copy key. See [Trello Dev docs](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/)
- create long-lived (`expire: "never"`) access token to the Trello app
- use this Trello API call to find out the list IDs. Note each Id.
  - Find your board Id: `GET https://api.trello.com/1/members/me/boards?fields=name,url&key=1$APP_KEY&token=$API_TOKEN`
  - Find the lists' ids: `GET https://api.trello.com/1/boards/$BOARD_ID/lists?key=$APP_KEY&token=$API_TOKEN`
- copy-paste list Ids to `global-config.js`
- fill in the other details in `global-config.js`
- start a webserver on port `7456` in the root of the project. Port can be any port you like.
  - Examples:
    - python 2: `python -m SimpleHTTPServer 7456`
    - python 3: `python3 -m http.server 7456`
    - More options on [github/willurd](https://gist.github.com/willurd/5720255)
- add Browser Source with `http://localhost:7456` to OBS
- make the browser source visible

## Testing / Verifying proper Setup

### Test Steps

- Open OBS and make the browser source visible
- open the Trello board in your browser
- open your Twitch channel's chat.
- Send a message to Twitch chat `!todo it works!!!!`

## Run after Setup completed

start a webserver on port `7456` in the root of the project. Port can be any port you like. Make sure your OBS Browser Source uses the same port though.

Examples:

- python 2: `python -m SimpleHTTPServer 7456`
- python 3: `python3 -m http.server 7456`
- More options on [github/willurd](https://gist.github.com/willurd/5720255)

### Expected Test Outcome

- OBS will show a card with the text `it works!!!!` in the browser overlay
- your Trello board has a card `it works!!!!` in the Todo list

Congratulations 😇 You now have a working Todo list overlay for Twitch integrated with Trello.

## Troubleshooting

Make sure you have some cards in Trello showing. If not add some, and reload the browser overlay.

If it the browser source doesn't come up, check `http://localhost:7456` in your browser. You should see at least the heading `Todos`. If not, your webserver is not running, or running on the wrong port.

If you see the heading `Todos`, check your console for errors. You should see logs `Connecting to irc-ws.chat.twitch.tv on port 443..` followed sometime later by `info: Joined #YOUR_CHANNEL_NAME`.

## Build for Streamers by a Streamer

Like the project? We build more cool stuff in the [TypeScript Teatime](https://www.twitch.tv/typescriptteatime) on Twitch. Come join us for a cup of 🍵 !
