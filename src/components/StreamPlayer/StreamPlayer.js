import ReactPlayer from "react-player";

import classes from './StreamPlayer.module.css';

const streamUrl = "https://7493b8ba4606.us-east-1.playback.live-video.net/api/video/v1/us-east-1.606331160837.channel.wUsr0my93s4U.m3u8";

const StreamPlayer = () => {
  return (
    <div className={classes.player}>
      <ReactPlayer light={true} url={streamUrl} width="100%" height="100%" playing />
    </div>
  );
};

export default StreamPlayer;
