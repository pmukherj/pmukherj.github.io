import React, { useState, useRef } from 'react';
import { PlayIcon, PauseIcon } from 'lucide-react';
interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  className = '',
  autoPlay = false,
  loop = true,
  muted = true,
  controls = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleVideoEnded = () => {
    if (loop && videoRef.current) {
      videoRef.current.play();
    } else {
      setIsPlaying(false);
    }
  };
  return <div className={`relative overflow-hidden ${className}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <video ref={videoRef} className="w-full h-full object-cover" poster={poster} autoPlay={autoPlay} loop={loop} muted={muted} onEnded={handleVideoEnded}>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {controls && (isHovering || !isPlaying) && <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 transition-opacity duration-200" aria-label={isPlaying ? 'Pause video' : 'Play video'}>
          <div className="bg-white bg-opacity-80 rounded-full p-3">
            {isPlaying ? <PauseIcon className="h-6 w-6 text-gray-900" /> : <PlayIcon className="h-6 w-6 text-gray-900" />}
          </div>
        </button>}
    </div>;
};
export default VideoPlayer;