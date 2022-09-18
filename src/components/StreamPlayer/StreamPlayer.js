import ReactPlayer from "react-player";

import classes from './StreamPlayer.module.css';

const streamUrl = "https://5ab61782dc20.us-east-1.playback.live-video.net/api/video/v1/us-east-1.557458351015.channel.l6pYjS72ScW9.m3u8"

const StreamPlayer = () => {
  return (
    <div className={classes.player}>
      <ReactPlayer light={true} url={streamUrl} width="99%" height="99%" playing />
    </div>
  );
};

export default StreamPlayer;
