// http://docs.angularjs.org/guide/directive
angular.module('directives', [])
.directive('ngSortable', function() {
    return function(scope, element, attrs, controller) {
        console.log('[DIRECTIVE] ngSortable="' + attrs.ngSortable + '"');

        scope.$watch(attrs.ngSortable, function(values) {
            var tracks = element.children(),
                x = tracks.length;

            while (x--) {
                var track = tracks[x]
                    dropzone = document.getElementById('dropzone');

                if (track.draggable && !track.handled) {
                    track.handled = true;
                    // dragstart
                    track.addEventListener('dragstart', function (e) {
                        dropzone.ignoreDrag = true;
                        e.dataTransfer.setData('trackid', e.target.id);
                        e.dataTransfer.setData('text/html', null);
                        this.style.opacity = '0.4';
                    }, false)

                    // dragend
                    track.addEventListener('dragend', function (e) {
                        dropzone.ignoreDrag = false;
                        this.style.opacity = '1';
                        this.classList.remove('over');
                    }, false)

                    // dragover
                    track.addEventListener('dragover', function (e) {
                        if (e.preventDefault) {
                            e.preventDefault();
                        }
                        e.dataTransfer.dropEffect = 'move';

                        return false;
                    }, false)

                    // dragenter
                    track.addEventListener('dragenter', function (e) {
                        dropzone.ignoreDrag = true;
                        this.classList.add('over');
                    }, false)

                    // dragleave
                    track.addEventListener('dragleave', function (e) {
                        dropzone.ignoreDrag = false;
                        this.classList.remove('over');
                    }, false)

                    // drop
                    track.addEventListener('drop', function (e) {
                        var source = -1,
                            dest = -1,
                            tracks = document.getElementById('tracklist').children,
                            el = document.getElementById(e.dataTransfer.getData('trackid')),
                            x = tracks.length;

                        this.classList.remove('over');
                        dropzone.ignoreDrag = false;

                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }

                        if (el.id == e.target.id) {
                            return false;
                        }

                        while (x--) {
                            // The dragSourceElement is a hack because the DnD
                            // API doesn't provide the element being dropped,
                            // so we have to store it in some freakkin global.
                            if (tracks[x].id == el.id) {
                                source = x;
                            }
                            if (tracks[x].id == e.target.id) {
                                dest = x;
                            }
                        }

                        console.log('Moving track #"' + el.id + '" from ' + source + ' to ' + dest);

                        if ((source != dest) && (source != -1 && dest != -1)) {
                            Beyer.Playlist.move(source, dest);
                        }

                        return false;
                    }, false)
                }
            }
        });
    };
});
