import StreamPlayer from "../components/StreamPlayer/StreamPlayer";
import Chat from "../components/Chat/Chat";

import classes from './Stream.module.css';

const Stream = () => {
  return (
    <div className={classes['stream-page']}>
      <StreamPlayer />
      <Chat />
    </div>
  );
};

export default Stream;
