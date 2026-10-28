export const projectPictures: Record<string, { src: string; alt: string; caption?: string; transparent?: boolean; comparison?: boolean; diagram?: boolean }> = {
  "nnlf-halide": { src: "/media/projects/nnlf-inference-transparent.png", alt: "Abstract neural tensor layers flowing into parallel processing lanes and a pixel grid", caption: "Illustrative image", transparent: true },
  "neural-loop-filters": { src: "/media/projects/loop-filter-comparison.png", alt: "Illustrative bird comparison: severe block compression artefacts on the left and clear feather detail on the right", caption: "Illustrative image", comparison: true },
  "neural-intra-prediction": { src: "/media/projects/intra-prediction.svg", alt: "Intra-frame prediction: highlighted decoded pixels above and left of a target block feed a neural predictor that continues the same image pattern", caption: "Illustrative image", diagram: true },
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
