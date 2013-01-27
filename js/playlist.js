Beyer = {};
Beyer.Playlist = {
    index: 0,
    isPlaying: false,
    stopAt: -1,
    audio: null,
    config: {
        loop: true,
        shuffle: false,
        muted: false,
        spectrum: true,
        canSpectrum: false
    },
    duration: {
        minutes: 0,
        seconds: '00'
    },
    elapsed: {
        minutes: 0,
        seconds: '00',
        percent: 0
    },
    trackList: [],
    errors: [],
    getIndex: function() {
        return this.index >= this.trackList.length ? 0 : this.index;
    },
    setIndex: function(index) {
        index = index || 0;
        if (this.config.shuffle) {
            console.log('Going full retard');
            this.index = Math.floor(Math.random() * (this.trackList.length));
        } else {
            this.index = (index >= this.trackList.length) ? 0 : index;
        }
    },
    addTrack: function(track) {
        var canPlay = (new Audio()).canPlayType(track.type);
        if (canPlay == "probably" || canPlay == "maybe") {
            console.log('Adding ' + track.name);
            this.trackList = this.trackList.concat(track);
        } else {
            this.addError("Format '" + track.type + "' (" + track.name + ") is not supported.");
        }
    },
    removeTrack: function(position) {
        var thisTrack = this.getIndex() === position,
            lastTrack = position === this.trackList.length - 1,
            wasPlaying = this.isPlaying;

        this.trackList.splice(position, 1);

        if (thisTrack) {
            if (lastTrack) {
                this.setIndex(0);
            }

            this.stop();
            if (this.trackList.length) {
                if (this.config.loop) {
                    this.reload();
                    if (!wasPlaying) {
                        this.pause();
                    }
                } else {
                    this.load();
                }
            }
        }
        if (this.stopAt === position) {
            this.stopAt = -1;
        }
    },
    load: function(index) {
        var index = index || this.getIndex(),
            track = this.trackList[index],
            url = window.URL || window.webkitURL,
            src = url.createObjectURL(track);

        if (this.getIndex() != index) {
            this.setIndex(index);
        }

        if (this.audio) {
            url.revokeObjectURL(this.audio.src);
        }

        this.audio = new Audio();
        this.audio.src = src;
        this.audio.load();
        this.audio.muted = this.config.muted;

        this.audio.addEventListener('loadedmetadata', function(e){
            var minutes = Math.floor(this.duration / 60),
                seconds = (Math.floor(this.duration) % 60).toFixed();

            Beyer.Playlist.duration.seconds = (seconds.length < 2) ? "0" + seconds : seconds;
            Beyer.Playlist.duration.minutes = minutes;

            Beyer.Playlist.config.canSpectrum = Boolean(this.mozChannels);
            if (Beyer.Playlist.config.canSpectrum) {
                Beyer.Spectrum.init(this);
            }

            Beyer.scope.$apply();
        }, false);

        this.audio.addEventListener('timeupdate', function(e) {
            var minutes = Math.floor(this.currentTime / 60),
                seconds = (Math.floor(this.currentTime) % 60).toFixed() + '',
                elapsed = (this.currentTime / this.duration) * 100;

            Beyer.Playlist.elapsed.minutes = minutes;
            Beyer.Playlist.elapsed.seconds = (seconds.length < 2) ? "0" + seconds : seconds;
            Beyer.Playlist.elapsed.percent = elapsed;

            Beyer.scope.$apply();
        }, false);

        this.audio.addEventListener('MozAudioAvailable', function(e) {
            if (Beyer.Playlist.config.canSpectrum) {
                Beyer.Spectrum.draw(e);
            }
        }, false);

        this.audio.addEventListener('ended', function(){
            Beyer.Playlist.next();
        }, false);
    },
    play: function() {
        console.log('Playing ' + this.trackList[this.getIndex()].name);
        this.isPlaying = true;
        this.audio.play();
    },
    playAt: function(index) {
        if (typeof(index) !== "number") {
            return false;
        }

        this.stop();
        this.load(index);
        this.play();
    },
    pause: function() {
        this.isPlaying = false;
        this.audio.pause();
    },
    stop: function() {
        console.log('Full stopping');
        this.pause();
        // this.audio = undefined;
        this.elapsed = {
            minutes: 0,
            seconds: '00',
            percent: 0
        }
        this.duration = {
            minutes: 0,
            seconds: '00'
        }
    },
    togglePlay: function() {
        if (!this.trackList.length) {
            return false;
        }
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }

        return this.isPlaying;
    },
    prev: function() {
        if (this.trackList.length === 0) {
            return false;
        }

        this.setIndex(this.getIndex() == 0 ? this.trackList.length - 1 : this.getIndex() - 1);
        if (this.isPlaying) {
            this.pause();
            if (this.getIndex() == this.trackList.length - 1) {
                if (this.config.loop) {
                    this.reload();
                }
            } else {
                this.reload();
            }
        } else {
            this.load();
        }
    },
    next: function() {
        if (this.trackList.length === 0) {
            return false;
        }

        var stop = (this.getIndex() === this.stopAt);

        if (stop) {
            this.stopAt = -1;
        }

        this.setIndex((this.getIndex() + 1) % this.trackList.length);
        this.config.muted = this.audio.muted;

        if (this.isPlaying) {
            if (this.getIndex() == 0) {
                if (!this.config.loop) {
                    stop = true;
                }
            }
        }

        if (stop) {
            this.stop();
            this.load();
            Beyer.scope.$apply();
        } else {
            this.reload();
        }
    },
    reload: function() {
        var url = window.URL || window.webkitURL;

        this.pause();
        url.revokeObjectURL(this.audio.src);
        this.audio = undefined;
        this.load();
        this.play();
    },
    seek: function(percentage) {
        var newCurrentTime = (percentage * this.audio.duration) / 100;

        console.log('Seeking to ' + percentage + '%');

        this.jumpTo(newCurrentTime);
    },
    jumpTo: function(time) {
        this.audio.currentTime = time;
    },
    syncShuffle: function() {
        if (!this.config.loop) {
            this.config.shuffle = false;
        }
    },
    syncLoop: function() {
        if (this.config.shuffle) {
            this.config.loop = true;
        }
    },
    toggleMute: function() {
        if (!this.audio) {
            return false;
        }

        this.audio.muted = this.config.muted;
    },
    toggleStopAt: function(index) {
        index = typeof(index) === "undefined" ? -1 : index;

        if (index === this.stopAt) {
            this.stopAt = -1;
        } else {
            this.stopAt = index;
        }
    },
    move: function(source, dest) {
        var length = this.trackList.length,
            max = Math.max(source, dest),
            min = Math.min(source, dest),
            newTrackList = this.trackList.slice(0, min),
            x = min - 1;

        var step = source < dest ? 1 : -1;

        while (x++ < max) {
            if (x == dest) {
                newTrackList[x] = this.trackList[source];
            } else {
                newTrackList[x] = this.trackList[x + step];
            }
        }

        console.log(this.trackList.slice(max + 1, length));
        newTrackList = newTrackList.concat(this.trackList.slice(max + 1, length));

        this.trackList = newTrackList;
        if (this.getIndex() == dest) {
            this.load();
        }
        Beyer.scope.$apply();
    },
    addError: function(error) {
        var exists = false,
            x = this.errors.length;

        while (x--) {
            if (this.errors[x] == error) {
                exists = true;
            }
        }
        if (!exists) {
            this.errors = this.errors.concat(error);
            console.log('[ERROR] ' + error);
        }
    },
    removeError: function (error) {
        var x = this.errors.length;
        while (x--) {
            if (this.errors[x] == error) {
                this.errors.splice(x, 1);
            }
        }
    }
};
