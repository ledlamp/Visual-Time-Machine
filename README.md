Ever wanted to go back in time and see what was on your screen at some point in the past? Well, you could if you had been running Visual Time Machine at that time. If you start using VTM now then you can do that in the future.

Visual Time Machine is a simple Node script that runs as a daemon to capture your screen at a regular interval (5 seconds is default). It exploits Discord as an unlimited image store for the screenshots. You can scroll up your Discord channel or use the search feature to see what was on your screen at any point in the past with ~5 second precision, after you started using VTM.

## Install
1. [Install Node.js](https://nodejs.org/en/download/) version >=10 if you haven't already.
2. [Download the repository as zip](https://github.com/ledlamp/Visual-Time-Machine/archive/master.zip) and extract it.
3. Open a Terminal/Command Prompt in the folder and run `npm install` to download dependencies.
4. Create a file named config.json and paste these contents.
```json
{
	"webhook": {
		"id": "paste_id_here",
		"token": "paste_token_here"
	},
	"interval": 5000,
	"capture_console_only": true
}
```
5. Create a webhook in the Discord channel you want the images to upload to (presumably a private channel of a private server). Copy the url and take the id and token out of it--the id is the big integer and the token is the long base64 string at the end, separated by slash--and paste in config.

The interval is time in milliseconds _between_ captures. Setting it to 0 will make it capture as fast as possible. Because it's the delay after the previous capture finishes, not a continuous interval starting each capture, it won't cause a stack overflow. It also means it will actually capture at a slightly slower interval than is configured, because the capturing and uploading takes a bit of time. Note that too low values will cause irregular capturing due to rate limiting. 3 seconds (3000 ms) is about the fastest you can consistently send a webhook message on Discord.

(Mac only) If `capture_console_only` is set to true, the screen will only be captured if it is on the physical display. This prevents the user's screen from being captured when it's not being used, though that means it won't be captured if it is used remotely.

The following steps depend on your platform & options.

### Mac OS (global)
6. Move the directory somewhere global. I put it at `/opt/vtm`.
7. Move `io.github.ledlamp.vtm.plist` into `/Library/LaunchAgents`.
8. If you put it somewhere other than `/opt/vtm`, update the path to the script in the plist. Edit the path to node if that's different too.
9. Make sure the files are owned by root: run `chown -R root /opt/vtm` and `chown root /Library/LaunchAgents/io.github.ledlamp.vtm.plist`. launchd doesn't like other people owning its plists!
10. Run `launchctl load -w ~/Library/LaunchAgents/io.github.ledlamp.vtm.plist` in each active user to start the agent without re-logging in. It will automatically run for each user who logs in and vice-versa. Enable `capture_console_only` option if you use multiple user accounts and don't want them all uploading screenshots when you're only using one.

### Mac OS (single user)
6. Rename and move the folder wherever you want in your home directory. You could move it to `~/Library/Visual Time Machine`.
7. Edit the file `io.github.ledlamp.vtm.plist` with the full path to the working directory, for example `/Users/you/Library/Visual Time Machine`. launchd does _NOT_ support globbing in the WorkingDirectory value so you have to specify the full path. If node is somewhere other than `/usr/local/bin/node`, update that path as well
8. Move the `io.github.ledlamp.vtm.plist` file into your `~/Library/LaunchAgents`.
9. Run `launchctl load -w ~/Library/LaunchAgents/io.github.ledlamp.vtm.plist` to start the agent. It will automatically start and stop whenever you login and logout.

### Windows
6. Put the directory wherever you want. I put mine at `C:\Program Files\Visual Time Machine`.
7. Install PM2: Run `npm install pm2 -g` in a command prompt.
8. Run `npm install pm2-windows-startup -g` and `pm2-startup install` to make the PM2 daemon start at boot.
9. cd to the program's directory and run `pm2 start index.js --name "Visual Time Machine"`
10. Run `pm2 save` to save the process list so it'll restart at boot.
This installation is single-user. If the display is switched to another user the screenshotter will capture black screens.

### Linux
Linux support will be added next time I'm on my Linux system. Open an issue if you want it now.
