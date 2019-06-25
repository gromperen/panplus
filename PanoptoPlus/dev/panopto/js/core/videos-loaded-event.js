/**
 * @file Promise/Callback for code that need the videos to be loaded before execution
 */
let VideosLoadedEvent = (() => {
    //private static variables
    let isWaiting = false;
    let isDone = false;
    let callbacks = $.Callbacks();

    /**
     * Private static function. Wait for video to load. This is detected by the change in src.
     * @private
     * @static
     * @param {DOM} videoDOM DOM of 1 video element
     * @returns {undefined}
     */
    async function waitForVideoLoad() {
        //MutationObserver suddenly stopped working so I'm going to use a more primitive method lmao
        let sleepMs = 20;
        while (verifyVideoLoad() != null) {
            await sleep(sleepMs++);
        }
        videosLoaded();
    };

    /**
     * Verify all videos have been loaded, else return video to await for
     * @private
     * @static
     * @returns {Video|null} Video element if found
     */
    function verifyVideoLoad() {
        var videoDOMs = document.querySelectorAll("video");
        for (var i = 0; i < videoDOMs.length; i++) {
            if (videoDOMs[i].src == "") {
                return videoDOMs[i];
            }
        }
        return null;
    }

    /**
     * private static function to call when videos are loaded
     * @private
     * @static
     * @returns {undefined}
     */
    function videosLoaded() {
        isDone = true;
        callbacks.fire();
        callbacks.empty();
        console.log("Videos Loaded");
    }

    /**
     * @file Class that manages the Promise/Callback for code that need the videos to be loaded before execution
     */
    class VideosLoadedEvent {
        /**
         * Subscribe to event when videos are loaded
         * @param {Function} resolve resolve method for promise
         * @returns {undefined}
         */
        static subscribe(resolve) {
            if (!isWaiting) {
                isWaiting = true;
                waitForVideoLoad.call(this);
            }
            if (!isDone) callbacks.add(function() { resolve(); });
            else resolve();
        }

        /**
         * Return all videoDOMs, primary video and secondary video.
         * Primary video refers to the video that the subtitles (and silence cues) are synced to in terms of timestamp.
         * If there is only 1 video stream, then the secondary video is undefined.
         * @return {{all: Array.<Video>, primaryVideoIndex: Number, primaryVideo: Video, secondaryVideo: Video}}
         */
        static getVideosElements() {
            let videoDOMs = document.querySelectorAll("video");
            //We want to ensure that both subtitles are synced. The transcript timestamps that we got are based on the one that starts earlier.
            //Thus, get the videoDOM with the lowest currentTime.
            let mainVideoIndex = 0;
            let min = videoDOMs[0].currentTime;
            for (let i = 1; i < videoDOMs.length; i++) {
                if (videoDOMs[i].currentTime < min) {
                    mainVideoIndex = i;
                    min = videoDOMs[i].currentTime;
                }
            }
            return {
                all: videoDOMs,
                primaryVideoIndex: mainVideoIndex,
                primaryVideo: videoDOMs[mainVideoIndex],
                secondaryVideo: videoDOMs[mainVideoIndex^1]
            };
        }
    }

    return VideosLoadedEvent;
})();