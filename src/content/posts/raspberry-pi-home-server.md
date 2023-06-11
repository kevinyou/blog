---
title: 'Raspberry Pi Home Server'
description: 'Another Raspberry Pi tutorial on the internet'
pubDate: 'Jun 10 2023'
heroImage: ''
---

I recently soft-bricked my Raspberry Pi docker installation (i.e. I can't be bothered to keep googling the cryptic error messages), and it was still on Raspbian Stretch which no longer receives support...

So time to reinstall everything on my Raspberry Pi! Might as well document this in case I need to perform disaster recovery.

The audience of this blog is myself in the future.

# Hardware
1. A Raspberry Pi.
	- I have a Raspberry Pi 3 Model B Rev 1.2
1. SD card
1. A way to write to SD cards
1. External hard drive with a separate power supply

# Burning Image to SD Card
Get the latest "lite" image from https://www.raspberrypi.com/software/

There are many different tools for formatting SD cards. This one happened to work for me on a Windows host machine. https://rufus.ie/en/

# Enabling Unsafe SSH
Now, there's a way to set up the image so that SSH is automatically enabled, but Windows plebs can't access the filesystem after imaging, so we are SOL.

# Booting up for the first time
Connect to a monitor and keyboard and plug it in!

You'll be prompted to set up a username and password for a non-root account.

# ssh
```
sudo raspi-config
```
Go to `Interface Options` -> SSH

# Network Config
Now connect the ethernet (if you haven't already)

Go to your Router and look for something like "DHCP Reservation". Assign an IP like `192.168.1.201`

# Enabling Safe SSH
First, add a ssh client public key to `~/.ssh/authorized_keys`

```shell
ssh <username>@192.168.1.201
sudo vi /etc/ssh/sshd_config
```
Set
```
PasswordAuthentication no
```

# Docker
```shell
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh
sudo usermod -a -G docker <username>
sudo systemctl enable docker
```
Then relogin in. Confirm success with a `docker ps`

# Docker Compose
This turned out more complicated than I expected.

Credits to [elalemanyo@dev.to](https://dev.to/elalemanyo/how-to-install-docker-and-docker-compose-on-raspberry-pi-1mo)
```
sudo apt-get install libffi-dev libssl-dev
sudo apt install python3-dev
sudo apt-get install -y python3 python3-pip

sudo pip3 install docker-compose
```

## The pip3 Detour™
After running `sudo pip3 install docker-compose` I got this error message
```
      =============================DEBUG ASSISTANCE=============================
      If you are seeing a compilation error please try the following steps to
      successfully install cryptography:
      1) Upgrade to the latest pip and try again. This will fix errors for most
         users. See: https://pip.pypa.io/en/stable/installing/#upgrading-pip
      2) Read https://cryptography.io/en/latest/installation/ for specific
         instructions for your platform.
      3) Check our frequently asked questions for more information:
         https://cryptography.io/en/latest/faq/
      4) Ensure you have a recent Rust toolchain installed:
         https://cryptography.io/en/latest/installation/#rust

      Python: 3.9.2
      platform: Linux-6.1.21-v7+-armv7l-with-glibc2.31
      pip: n/a
      setuptools: 67.8.0
      setuptools_rust: 1.6.0
      rustc: n/a
      =============================DEBUG ASSISTANCE=============================

  error: can't find Rust compiler

  If you are using an outdated pip version, it is possible a prebuilt wheel is available for this package but pip is not able to install from it. Installing from the wheel would avoid the need for a Rust compiler.

  To update pip, run:

      pip install --upgrade pip

  and then retry package installation.

  If you did intend to build this package from source, try installing a Rust compiler from your system package manager and ensure it is on the PATH during installation. Alternatively, rustup (available at https://rustup.rs) is the recommended way to download and update the Rust compiler toolchain.

  This package requires Rust >=1.56.0.
  ----------------------------------------
  ERROR: Failed building wheel for cryptography

```
[Here's a spicy comment on a spicy Stack Overflow post](https://stackoverflow.com/questions/66118337/how-to-get-rid-of-cryptography-build-error#comment118420554_66334084) that pointed me toward the solution. They don't want people to `CRYPTOGRAPHY_DONT_BUILD_RUST` so let's follow their advice!

You know what that means? It's time for-
### The Rust Detour™
Run
```
curl https://sh.rustup.rs -sSf | sh
```
[Thanks geekforgeeks](https://www.geeksforgeeks.org/how-to-install-rust-on-raspberry-pi/#)

## ...Back to Docker Compose
Confirm The Rust Detour™ is over by running `cargo --version` and `rustc --version`

Confirm the pip3 Detour™ is over by rerunning `sudo pip3 install docker-compose`

Wait that didn't work either, same error message...

## pip Detour 2™
[After some more slack digging](https://github.com/snipsco/snips-nlu/issues/861) I realized the issue could be env variables. After all, I installed rust on my non-root user.

So let's retry `pip3 install docker-compose` and... it's very slow.

[Like, canonically slow.](https://github.com/pyca/cryptography/issues/7905)

This is truly the worst detour of all.

Anyway, after about 10 minutes it finally finished. Yay doing things the "right" way, it totally pays off (? debatable). I left a [foreboding but helpful comment.](https://dev.to/elalemanyo/how-to-install-docker-and-docker-compose-on-raspberry-pi-1mo#comment-278j3)


## Finally Docker Compose
Finally confirmed Docker Compose is installed by running `docker-compose --version`. Re-logging in was needed.

# One More Detour
I hate it here.

```
ERROR: for ddclient  Get "https://registry-1.docker.io/v2/linuxserver/ddclient/manifests/sha256:512d82147283b540f92087e5018001c225fca072b932fe9d6914d1027f4113b8": dial tcp: lookup registry-1.docker.io on 192.168.1.1:53: no such host
```

There's a lot of solutions out there posted but this is the one that finally worked for me: https://stackoverflow.com/a/55770800

```
sudo vi /etc/resolvconf/resolv.conf.d/original
```
Remove `nameserver 192.168.1.1`

Add `namespace 8.8.8.8` and `namespace 8.8.4.4` to `/etc/resolvconf/resolv.conf.d/base`

I'm guessing this is less of a Docker problem and more of a general DNS thing.

This took way too long

# External Hard Drive
```
sudo mkdir -p /path/to/hard/drive
sudo mount /dev/sda2 /path/to/hard/drive -o uid=<username>,gid=<username>
```

To mount on startup, first find the uuid of the hard drive
```
lsblk -f
```

Then edit the file system table, `/etc/fstab`, and add:
```
UUID=<UUID> /path/to/hard/drive ntfs defaults,noatime,nofail 0 2
```

# Docker Containers
Remember to use image for the right architecture for your Raspberry Pi model. For my model, it's `arm32v7`[^1].

[^1]: While writing this blog, I learned that [support for this architecture is ending at the beginning of July](https://www.linuxserver.io/armhf). Wow what great timing! This blog will almost immediately become obsolete!

[linuxserver.io](https://www.linuxserver.io/) has a lot of community maintained images for popular server software.


I keep all my docker-compose files on the hard drive, which makes the docker images below even easier to recover.

Set PUID and GUID to your non-root user, probably `1000`, but you can check using
```
id -u <username>
```

`restart: unless-stopped` allows these containers to be restarted on host startup

## ddclient
```yaml
---
version: "2"
services:
  ddclient:
    image: linuxserver/ddclient:arm32v7-latest
    container_name: ddclient
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/London
    volumes:
      - /path/to/hard/drive/ddclient/config:/config
    restart: unless-stopped

```

## Transmission
```yaml
---
version: "2"
services:
  transmission:
    image: linuxserver/transmission:arm32v7-2.94-r1-ls14
    container_name: transmission
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Los_Angeles
    volumes:
      - /path/to/hard/drive/transmission/config:/config
      - /path/to/hard/drive/transmission/downloads:/downloads
      - /path/to/hard/drive/transmission/watch:/watch
    ports:
      - 9091:9091
      - 51413:51413
      - 51413:51413/udp
    restart: unless-stopped
```

# Plex
```yaml
---
version: "2"
services:
  plex:
    image: linuxserver/plex:arm32v7-1.32.2
    container_name: plex
    network_mode: host
    environment:
      - PUID=1000
      - GUID=1000
      - TZ=America/Chicago
    volumes:
      - /path/to/hard/drive/media:/mnt/media
    restart: unless-stopped
```
