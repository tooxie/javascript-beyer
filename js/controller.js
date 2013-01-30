Beyer.controller = function ($scope) {
    Beyer.scope = $scope;
    $scope.playlist = Beyer.Playlist;

    var dropzone = document.getElementById('dropzone');

    dropzone.addEventListener('drop', function (e) {
        document.getElementById('playlist').classList.remove('over');
        e.stopPropagation();
        e.preventDefault();

        var tracks = e.dataTransfer.files;
        for (var i = 0, track; track = tracks[i]; i++) {
            Beyer.Playlist.addTrack(track);
        }

        if (!Beyer.Playlist.audio && Beyer.Playlist.trackList.length) {
            Beyer.Playlist.load();
        }

        $scope.$apply();
    }, false);

    dropzone.addEventListener('dragend', function (e) {
        document.getElementById('playlist').classList.remove('over');
    }, false);

    dropzone.addEventListener('dragenter', function (e) {
        if (!this.ignoreDrag) {
            document.getElementById('playlist').classList.add('over');
        }
    }, false);

    dropzone.addEventListener('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, false)

    document.getElementById('seeker').addEventListener('click', function(e) {
        var offset = e.pageX - e.target.offsetLeft || e.target.offsetX,
            width = e.target.offsetWidth,
            percentage = ((offset / width) * 100).toFixed(2);

        Beyer.Playlist.seek(percentage);
    }, false);
};
