Ever wanted to go back in time and see what was on your screen at some point in the past? Well, you could if you had been running Visual Time Machine at that time. If you start using VTM now then you can do that in the future.

Visual Time Machine is a simple Node script that runs as a daemon to capture your screen at a regular interval (5 seconds is default). It exploits Discord as an unlimited image store for the screenshots. You can scroll up your Discord channel or use the search feature to see what was on your screen at any point in the past with ~5 second precision, after you started using VTM.

# Install
1. [Install Node.js](https://nodejs.org/en/download/) version >=10 if you haven't already.
	- If on Linux, ImageMagick (specifically, the `import` command) is required: `sudo apt install imagemagick`
	- [.NET framework](https://dotnet.microsoft.com/download/thank-you/net48) must be installed for screen capturing on Windows.
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
	"capture_console_only": true,
	"disable_on_inactive_session": false,
	"disable_on_metered_networks": false
}
```
5. Create a webhook in the Discord channel you want the images to upload to (presumably a private channel of a private server). Copy the url and take the id and token out of it--the id is the big integer and the token is the long base64 string at the end, separated by slash--and paste in config.

The interval is time in milliseconds _between_ captures. Setting it to 0 will make it capture as fast as possible. Because it's the delay after the previous capture finishes, not a continuous interval starting each capture, it won't cause a stack overflow. It also means it will actually capture at a slightly slower interval than is configured, because the capturing and uploading takes a bit of time. Note that too low values will cause irregular capturing due to rate limiting. 3 seconds (3000 ms) is about the fastest you can consistently send a webhook message on Discord.

(Mac only) If `capture_console_only` is set to true, the screen will only be captured if it is on the physical display. This prevents the user's screen from being captured when it's not being used, though that means it won't be captured if it is used remotely.

If you have a Pro or Enterprise edition of Windows, you can change `disable_on_inactive_session` to `true` to prevent VTM from capturing black screens when you've locked your session.

If you're on Windows 10 and Powershell scripts are enabled, you can toggle `disable_on_metered_networks` to disable capturing when you are connected to a metered network. This might be a bit resource intensive so it's recommended to leave this false if you never connect to metered networks.

6. Test the program by running `node vtm.js` in a Terminal.

The following steps depend on your platform & options.

## Mac OS
### All users
7. Move the directory somewhere global. I put it at `/opt/vtm`.
8. Move `io.github.ledlamp.vtm.plist` into `/Library/LaunchAgents`.
9. If you put it somewhere other than `/opt/vtm`, update the path to the script in the plist. Edit the path to node if that's different too.
10. Make sure the files are owned by root: run `chown -R root /opt/vtm` and `chown root /Library/LaunchAgents/io.github.ledlamp.vtm.plist`. launchd doesn't like other people owning its plists!
11. Run `launchctl load -w ~/Library/LaunchAgents/io.github.ledlamp.vtm.plist` in each active user to start the agent without re-logging in. It will automatically run for each user who logs in and vice-versa. Enable `capture_console_only` option if you use multiple user accounts and don't want them all uploading screenshots when you're only using one.

### Single user
7. Rename and move the folder wherever you want in your home directory. You could move it to `~/Library/Visual Time Machine`.
8. Edit the file `io.github.ledlamp.vtm.plist` with the full path to the working directory, for example `/Users/you/Library/Visual Time Machine`. launchd does _NOT_ support globbing in the WorkingDirectory value so you have to specify the full path. If node is somewhere other than `/usr/local/bin/node`, update that path as well
9. Move the `io.github.ledlamp.vtm.plist` file into your `~/Library/LaunchAgents`.
10. Run `launchctl load -w ~/Library/LaunchAgents/io.github.ledlamp.vtm.plist` to start the agent. It will automatically start and stop whenever you login and logout.

## Windows
7. Put the directory wherever you want. I put mine at `C:\Program Files\Visual Time Machine`.
8. Install PM2: Run `npm install pm2 -g` in a command prompt.
9. Run `npm install pm2-windows-startup -g` and `pm2-startup install` to make the PM2 daemon start at boot.
10. cd to the program's directory and run `pm2 start vtm.js`
11. Run `pm2 save` to save the process list so it'll be reloaded at reboot.

This installation will only work for a single user.

## Linux (Ubuntu)
### All users
7. Put the directory at `/opt/vtm` or somewhere global. If putting it somewhere else, make sure to update the path in the desktop file.
8. Move `visual-time-machine.desktop` into `/etc/xdg/autostart` or wherever the global autostart applications are.
9. The daemon should start with each user who logs in to their X session. You can start it without re-logging with `node vtm.js & disown` in the program directory.

Note: The screenshotter will continue to capture black screens when the user session is locked or switched out. Also, apparently the program does not exit when logging out, but it will stop capturing as there's no X session. When logging back in, another process will start and both will be capturing at the same time.

### Single user
You could use the same kind of method used for global installation (XDG autostart) by putting the desktop file in your `~.config/autostart`, but an alternative method that is probably better due to the lack of the issues noted above is to simply start the process at boot using systemd, crontab, or pm2. The process will just be always there but only function when you are logged in to your X session.

Crontab is the simplest method:

7. Put the directory somewhere in your user account, maybe at `~/.vtm`.
8. Type `crontab -e` in a terminal and add the line `@reboot /usr/bin/node $HOME/.vtm/vtm.js` (adjust paths as necessary)
9. Start the program without a reboot with `node ~/.vtm/vtm.js & disown`.
