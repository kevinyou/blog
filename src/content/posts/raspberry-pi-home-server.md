---
title: 'Raspberry Pi Home Server'
description: 'Another Raspberry Pi tutorial on the internet'
pubDate: 'Jun 10 2023'
updatedDate: 'Mar 5 2025'
heroImage: ''
---

I recently soft-bricked my Raspberry Pi docker installation (i.e. I can't be bothered to keep googling the cryptic error messages), and it was still on Raspbian Stretch which no longer receives support...

So time to reinstall everything on my Raspberry Pi! Might as well document this in case I need to perform disaster recovery.

The audience of this blog is myself in the future.

## Hardware
1. A Raspberry Pi.
	- I have a Raspberry Pi 3 Model B Rev 1.2
1. SD card
1. A way to write to SD cards (an SD card slot or adapter)
1. (optional) External hard drive with a separate power supply

## Burning Image to SD Card
Use imager: https://www.raspberrypi.com/software/ to install the latest Raspberry Pi OS for your Raspberry Pi.

Configure password in settings, and enable SSH via username and password, OR go ahead and add an ssh key at this step.

## Network Config
Now connect the ethernet (if you haven't already)

Go to your Router and look for something like "DHCP Reservation". Assign an IP like `192.168.1.201`

## Enabling Safe(r) SSH
Do this if you didn't already set up an ssh key while configuring the image.

First, add a ssh client public key to `~/.ssh/authorized_keys`
```shell
ssh <username>@192.168.1.201
cd ~/
mkdir .ssh
vi .ssh/authorized_keys
```

Then, disable password auth
```shell
sudo vi /etc/ssh/sshd_config
```
Set
```
PasswordAuthentication no
```

## Install Docker
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

<!--
`systemctl --user enable --now dbus` failed,
and docker and docker-compose only works on root
-->

Then relogin in. Confirm success with a `docker ps` and `docker run hello-world`

If that fails due to `connect: network is unreachable`...

### Detour: Fix resolvconf
```
sudo apt install resolvconf
sudo vi /etc/resolvconf/resolv.conf.d/original
```
Remove this line:
```
nameserver 192.168.1.1
```

```
sudo vi /etc/resolvconf/resolv.conf.d/base
```
Add these lines:
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```
Run
```
sudo resolvconf -u
```

#### Detour of Detour: Fix personal router DNS
```
Servers allocated with DHCP requests:
DHCP DNS Type: Default Servers Custom Servers
Primary DNS:
Secondary DNS:
```
Then `sudo reboot now`

## Install Docker Compose
```
sudo apt install docker-compose
```

This installs it for the root user as well. Commands need to be run like `sudo docker ps` and `sudo docker-compose`
<!--
OLDER WAY

This turned out more complicated than I expected.

Credits to [elalemanyo@dev.to](https://dev.to/elalemanyo/how-to-install-docker-and-docker-compose-on-raspberry-pi-1mo)
```
sudo apt-get install libffi-dev libssl-dev
sudo apt install python3-dev
sudo apt-get install -y python3 python3-pip

pip3 install docker-compose
```
-->

## External Hard Drive
Assuming external hard drive is located at `/dev/sda2`
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

Try it out by restarting with `sudo reboot now`

## Docker Containers
Remember to use image for the right architecture for your Raspberry Pi model. For my model, it's `arm64v8`[^1].

[^1]: In the first version of this post I went through these instructions for `arm32v7`, only to learn at the end [that support for it is getting removed at the beginning of July.](https://www.linuxserver.io/armhf). So I went through all of these steps again for `arm64v8`. This also meant this blog was immediately useful to me less than 24 hours later :)

[linuxserver.io](https://www.linuxserver.io/) has a lot of community maintained images for popular server software.


I keep all my docker-compose files on the hard drive, which makes the docker images below even easier to recover when the SD card corrupts (which it does often!)

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
