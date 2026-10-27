export const projectPictures: Record<string, { src: string; alt: string }> = {
  "nnlf-halide": { src: "/media/projects/landscape.jpg", alt: "Alpine landscape illustrating fine image detail" },
  "neural-loop-filters": { src: "/media/projects/compression.jpg", alt: "Bird photograph beside a JPEG-compressed version" },
  "neural-intra-prediction": { src: "/media/projects/flower.jpeg", alt: "Flower painting used as an illustrative compression sample" },
  apv: { src: "/media/projects/professional-camera.jpg", alt: "Professional video camera in use, photographed by Popperipopp" },
};
export const projectTools: Record<string, { name: string; href: string }[]> = {
  "nnlf-halide": [{ name: "Halide", href: "https://halide-lang.org/" }],
  "neural-loop-filters": [{ name: "PyTorch", href: "https://pytorch.org/" }],
  "neural-intra-prediction": [{ name: "VVC Test Model", href: "https://vcgit.hhi.fraunhofer.de/jvet/VVCSoftware_VTM" }],
  apv: [{ name: "OpenAPV", href: "https://github.com/AcademySoftwareFoundation/openapv" }, { name: "FFmpeg", href: "https://ffmpeg.org/" }, { name: "Adobe Premiere Pro", href: "https://www.adobe.com/products/premiere.html" }],
  robomaster: [{ name: "ROS", href: "https://www.ros.org/" }, { name: "OpenCV", href: "https://opencv.org/" }],
  chandrayaan: [{ name: "SwinIR", href: "https://github.com/JingyunLiang/SwinIR" }],
};
