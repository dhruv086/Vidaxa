import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfprobePath("C:/Users/dhruv/Downloads/ffmpeg-2025-06-04-git-a4c1a5b084-full_build/ffmpeg-2025-06-04-git-a4c1a5b084-full_build/bin/ffprobe.exe");

const getVideoDuration = async (url) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(url, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const durationInSeconds = metadata.format.duration;
        resolve(durationInSeconds);
      }
    });
  });
};

export { getVideoDuration };
