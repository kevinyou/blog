---
title: 'Raspberry Pi Home Server'
description: 'Another Raspberry Pi tutorial on the internet'
pubDate: 'Jun 10 2023'
heroImage: ''
---

I recently soft-bricked my Raspberry Pi docker installation (i.e. I can't be bothered to keep googling the cryptic error messages), and it was still on Raspbian Stretch which no longer receives support...

So time to reinstall everything on my Raspberry Pi! Might as well document this in case I need to perform disaster recovery.

The audience of this blog is myself in the future.

## Hardware
1. A Raspberry Pi.
	- I have a Raspberry Pi 3 Model B Rev 1.2
1. SD card
1. A way to write to SD cards
1. External hard drive with a separate power supply

## Burning Image to SD Card
Get the latest "lite" image from https://www.raspberrypi.com/software/

There are many different tools for formatting SD cards. This one happened to work for me on a Windows host machine. https://rufus.ie/en/

## Enabling Unsafe SSH
Now, there's a way to set up the image so that SSH is automatically enabled, but Windows plebs can't access the filesystem after imaging, so we are SOL.

## Booting up for the first time
Connect to a monitor and keyboard and plug it in!

You'll be prompted to set up a username and password for a non-root account.

## ssh
```
sudo raspi-config
```
Go to `Interface Options` -> SSH

## Network Config
Now connect the ethernet (if you haven't already)

Go to your Router and look for something like "DHCP Reservation". Assign an IP like `192.168.1.201`

## Enabling Safe SSH
First, add a ssh client public key to `~/.ssh/authorized_keys`

```shell
ssh <username>@192.168.1.201
sudo vi /etc/ssh/sshd_config
```
Set
```
PasswordAuthentication no
```

## Docker
```shell
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh
sudo usermod -a -G docker <username>
sudo systemctl enable docker
sudo apt-get install -y uidmap
dockerd-rootless-setuptool.sh install
systemctl --user enable --now dbus
```

Then relogin in. Confirm success with a `docker ps` and `docker run hello-world`

## Docker Compose
This turned out more complicated than I expected.

Credits to [elalemanyo@dev.to](https://dev.to/elalemanyo/how-to-install-docker-and-docker-compose-on-raspberry-pi-1mo)
```
sudo apt-get install libffi-dev libssl-dev
sudo apt install python3-dev
sudo apt-get install -y python3 python3-pip

pip3 install docker-compose
```

## Detour
I hate it here.

```
ERROR: for ddclient  Get "https://registry-1.docker.io/v2/linuxserver/ddclient/manifests/sha256:512d82147283b540f92087e5018001c225fca072b932fe9d6914d1027f4113b8": dial tcp: lookup registry-1.docker.io on 192.168.1.1:53: no such host
```

There's a lot of solutions out there posted but this is the one that finally worked for me: https://stackoverflow.com/a/55770800

```
sudo apt install resolvconf
sudo vi /etc/resolvconf/resolv.conf.d/original
```
Remove `nameserver 192.168.1.1`

```
sudo vi /etc/resolvconf/resolv.conf.d/base
```
Add
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```
Run
```
sudo resolvconf -u
```

I even went into my router settings again and changed these to Google DNS
```
Servers allocated with DHCP requests:
DHCP DNS Type: Default Servers Custom Servers
Primary DNS:
Secondary DNS:
```
Need to check again later


I'm guessing this is less of a Docker problem and more of a general DNS thing.

This took way too long

## External Hard Drive
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

## Docker Containers
Remember to use image for the right architecture for your Raspberry Pi model. For my model, it's `arm64v8`[^1].

[^1]: In the first version of this post I went through these instructions for `arm32v7`, only to learn at the end [that support for it is getting removed at the beginning of July.](https://www.linuxserver.io/armhf). So I went through all of these steps again for `arm64v8`. This also meant this blog was immediately useful to me less than 24 hours later :)

[linuxserver.io](https://www.linuxserver.io/) has a lot of community maintained images for popular server software.


I keep all my docker-compose files on the hard drive, which makes the docker images below even easier to recover.

Set PUID and GUID to your non-root user, probably `1000`, but you can check using
```
id -u <username>
```

`restart: unless-stopped` allows these containers to be restarted on host startup

### ddclient
```yaml
---
version: "2"
services:
  ddclient:
    image: linuxserver/ddclient:arm64v8-latest
    container_name: ddclient
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/London
    volumes:
      - /path/to/hard/drive/ddclient/config:/config
    restart: unless-stopped

```

### Transmission
```yaml
---
version: "2"
services:
  transmission:
    image: linuxserver/transmission:arm64v8-2.94-r1-ls14
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

## Plex
```yaml
---
version: "2"
services:
  plex:
    image: linuxserver/plex:arm64v8-1.32.2
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
