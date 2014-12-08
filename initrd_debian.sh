#!/bin/sh

### BEGIN INIT INFO
# Provides:          twitter_proxy
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the twitter_proxy server
# Description:       starts twitter_proxy using start-stop-daemon
### END INIT INFO

PATH=/sbin:/bin:/usr/sbin:/usr/bin

BIN=/home/morriswinkler/gameserver/main
PIDFILE=/var/run/ninjasinthebox.pid
USER=root
GROUP=root

test -f $BIN || exit 0
set -e
case "$1" in
  start)
    echo -n "Starting ninjasinthebox server: "
    start-stop-daemon --start --chuid $USER:$GROUP \
        --make-pidfile --background --pidfile $PIDFILE \
        --exec $BIN -- --config=/home/morriswinkler/gameserver/config.ini
    echo "ninjasinthebox."
    ;;
  stop)
    echo -n "Stopping ninjasinthebox server: "
    start-stop-daemon --stop --quiet --pidfile $PIDFILE --exec $BIN
    rm -f $PIDFILE
    echo "ninjasinthebox."
    ;;
  restart)
    echo -n "Restarting ninjasinthebox server: "
    $0 stop
    sleep 1
    $0 start
    echo "ninjasinthebox."
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}" >&2
    exit 1
    ;;
esac
exit 0
