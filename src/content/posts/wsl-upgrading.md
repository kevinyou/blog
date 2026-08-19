---
title: 'Some Tips About WSL2'
description: 'Back to tutorials in the LLM age'
pubDate: 'Feb 24 2026'
updatedDate: 'Aug 18 2026'
---
I installed WSL1 back in April 2019. What a time. It kinda sucked back then.

Then WSL2 came out in 2020. I held off for a few years because of an awkward situation: WSL2 required virtualization turned on, but hit first-person spyware VALORANT from Riot Games® required me to turn it off to play. [^1]:

[^1]: Well the [common solution](https://web.archive.org/web/20260218200305/https://support-valorant.riotgames.com/hc/en-us/articles/16941220890899-Addressing-Virtualization-based-security-VBS-settings-on-Windows-10-VAN9005-VALORANT) is to have a motherboard with TPM 2.0, which my motherboard didn't (still doesn't!) have. Shoutout Windows 11 for trying to get me to upgrade just for TPM 2.0. (I won't!)

Around May 2022 I finally decided to cutover to WSL2, and I foolishly went with 20.04 despite 22.04 having just come out.

Well, it's almost May 2026 now and 20.04 is going out of LTS, so I have to finally do some maintenance.

There's a lot of legacy and different ways to do things with WSL, so I wrote some tips here.

Everything here is specifically WSL2 because a lot changed between WSL1 and WSL2. That, it itself, is a pain for search optimization, and probably LLMs too.

Everything is run in Powershell instead of Command Prompt because it has nicer handling of spaces in folders and filenames, but beware that the syntax is slightly different.

## You should update your wsl.exe command itself
For a while I didn't even know what version of wsl.exe I had because `wsl --version` didn't work. Apparently the `--version` flag itself came in a later version - [in November 2022](https://web.archive.org/web/20260122004826/https://devblogs.microsoft.com/commandline/the-windows-subsystem-for-linux-in-the-microsoft-store-is-now-generally-available-on-windows-10-and-11/).
Damn, that's what I get for being an early adopter.

Much like `npm` or other commands, `wsl` has a built-in way to update itself:
```powershell
wsl --update
```

## Moving WSL2 Distros
You may want to move distros if they were installed on a drive that's running out of space, to a disk with more space.

In this example below, let's assume you have another disk at `D:\`, and you are moving your Ubuntu-20.04 distro (like I did).

### The Easy Way: --manage --move
Latest versions of wsl have an easy solution using these flags.
```powershell
# View distro names
wsl -l -v


# Terminat instances
wsl --shutdown

# Confirm no more are running
wsl -l -v

# Long-term folder to store your distro files. You can name it whatever.
mkdir D:\WSL\Ubuntu-20.04
# Import to a new permanent location on the D:\ drive
wsl --manage Ubuntu-20.04 --move D:\WSL\Ubuntu-20.04
```

### The Hard Way: export and import (which I ended up doing accidentally)

<details>
<summary>
	Click here for details about the hard way
</summary>

From cmd.exe or powershell:
```powershell
# View distro names
wsl -l -v

# Terminat instances
wsl --shutdown

# Confirm no more are running
wsl -l -v

# Create a place to store backup
mkdir D:\Path\To\Backup\Folder

# Takes a few minutes. To check progress, look at the file's size in File Explorer
# Replace Ubuntu-20.04 with the name of your distro, from the `wsl -l -v` command
wsl --export Ubuntu-20.04 D:\Path\To\Backup\Folder\ubuntu-backup-filename.tar

wsl --unregister Ubuntu-20.04
# This should also delete the ext4.vhdx from your LocalState folder, freeing disk space on your main drive (persumably C:\)

# Long-term folder to store your distro files. You can name it whatever.
mkdir D:\WSL\Ubuntu-20.04
# Import to a new permanent location on the D:\ drive
wsl --import Ubuntu-20.04 D:\WSL\Ubuntu-20.04 D:\Path\To\Backup\Folder/ubuntu-backup-filename.tar --version 2
```

Now, open your Ubuntu terminal with something like Windows Terminal. You may notice it logs you back into root. See the next section about how to set default user.


</details>

## Setting Default User

### Easy but legacy: config --default-user
A common solution to this is to run a command like `ubuntu config --default-user youruser`. This is the suggestion that [Microsoft themselves suggest](https://web.archive.org/web/20260218190816/https://learn.microsoft.com/en-us/windows/wsl/basic-commands#change-the-default-user-for-a-distribution), although it's very poorly documented in my opinion.

You probably aren't familiar with the fact that your WSL2 distro is itself a Windows executable. For me, my executable was actually called `ubuntu2004.exe`. No, not the year 2004[^2], that's just 20.04 shortened in a really confusing way.

[^2]: coincidentally Ubuntu's [first release was 4.10 released in October 2004](https://en.wikipedia.org/wiki/Ubuntu_version_history#Ubuntu_4.10_(Warty_Warthog)). I don't have to archive.org Wikipedia right? Well whatever I'm lazy

Anyway, run something like
```powershell
ubuntu2004 config --default-user yourname
```

Apparently though, future version of Ubuntu don't always ship with an executable, so this might not be the best way going forward. In that case...

### Slightly harder but more modern: edit `/etc/wsl.conf`

Inside your Linux distro, you can edit the `/etc/wsl.conf` file and concat the following contents:

```ini
[user]
default=yourname
```

## Installing a new distro on non-C drive

Alright, so all that work to move an existing distro was a pain in the ass. I'm sure installing a fresh distro won't be too bad?

Welp.

Go to [this ugly Apache website](https://cdimages.ubuntu.com/ubuntu-wsl/), and go to the only release avaialble. Pray it's the one you actually want. Don't know what the Ubuntu version codename maps to? Go Google it. Man, what a hostile user experience. Anyway, download the `.wsl` image and put it somewhere convenient.

Now run this:
```powershell
# Same long-term folder as before. Keeping your distros nicely organized is convenient for when you inevitably come back to this guide every 2 years.
mkdir D:\WSL\Ubuntu-24.04
# noble-wsl-amd64.wsl is the file I downloaded. Noble is Ubuntu 24.04.
wsl --import Ubuntu-24.04 D:\WSL\Ubuntu-24.04\ 'D:\Path\To\Your\Convenient\Downloaded\noble-wsl-amd64.wsl' --version 2
```

This should install the distro to your Start Menu. If you run it (and your preferred terminal opens), you will get logged in as root. Go create a sudo user:
```bash
createuser yourusername
usermod -aG sudo yourusername

# See previous section about this file
sudo vim /etc/wsl.conf
```
You may need to rerun `wsl --shutdown` to restart the distro to this conf change applies.

## Copying files from previous distro to new distro

TBD! Haven't done that yet. I'm going to bed, this already took way too long.


