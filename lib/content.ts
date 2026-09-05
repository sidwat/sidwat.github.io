/**
 * Content for the site, synced from `sidhartha_watsa_cv_master-4.pdf`.
 *
 * The CV is the source of truth: where it disagreed with the older Jekyll
 * material, the CV won. Nothing here is invented — copy is condensed from the
 * CV's own wording, not rewritten.
 *
 * Kept as typed data rather than MDX so the pages stay simple, and so a later
 * move to a CMS is a change of source without touching the rendering.
 */

export type Segment = { text: string; href?: string };

export type Role = {
  org: string;
  title: string;
  /** Lab, centre or division, and the supervising academic where there is one. */
  unit?: string;
  location: string;
  /** Sort key only. `period` is what gets shown. */
  start: string;
  period: string;
  points: string[];
};

export type Publication = {
  title: string;
  venue: string;
  year: number;
  kind: "Journal" | "Conference";
  url: string;
  citation: string;
  abstract: string;
};

export type Patent = {
  title: string;
  applicationNo: string;
  summary: string;
};

export type Project = {
  title: string;
  affiliation: string;
  points: string[];
};

export type Teaching = {
  title: string;
  invitedBy: string;
  venue: string;
  location: string;
  period: string;
  points: string[];
};

export type Education = {
  degree: string;
  institution: string;
  location: string;
  period: string;
  detail?: string;
  href?: string;
};

export const hero = {
  eyebrow: "MS Computer Science · UC San Diego",
  bio:
    "I work on making video smaller — next-generation codec standards in " +
    "Samsung’s AI Visual Processing Lab, and now a master’s in computer " +
    "science at UC San Diego. Before that, imitation learning at IISc " +
    "Bangalore and autonomous systems at IIT Kanpur.",
};

export const researchInterests = [
  "Robotic perception",
  "3D vision",
  "Efficient and on-device AI",
  "Hardware–software co-design",
  "Imitation learning",
];

export const bio: Segment[] = [
  {
    text: "I was born in a small beautiful town, Jamshedpur in India. I pursued a Bachelor of Technology in Mechanical Engineering with a double major in Electrical Engineering from ",
  },
  { text: "IIT Kanpur", href: "https://www.iitk.ac.in/" },
  {
    text: ". My research interests lie in computer vision, robotics, deep learning, embedded systems and mathematics generally. In college I led ",
  },
  { text: "team ERA", href: "https://era.sntiitk.com/" },
  {
    text: ", a group focused on real-time autonomous systems. After finishing my coursework I joined the ",
  },
  {
    text: "Robert Bosch Centre for Cyber-Physical Systems",
    href: "https://cps.iisc.ac.in/",
  },
  { text: " at " },
  { text: "IISc Bangalore", href: "https://iisc.ac.in/" },
  { text: ", where I worked on imitation learning. I then joined " },
  {
    text: "Samsung Research Institute Bangalore",
    href: "https://research.samsung.com/sri-b",
  },
  {
    text: ", contributing to next-generation video codec standards in the AI Visual Processing Lab. I am now reading for a master’s in computer science at ",
  },
  { text: "UC San Diego", href: "https://cse.ucsd.edu/" },
  { text: "." },
];

export const education: Education[] = [
  {
    degree: "Master of Science, Computer Science",
    institution: "University of California, San Diego",
    location: "San Diego, California",
    period: "Sep 2026 — present",
    href: "https://cse.ucsd.edu/",
  },
  {
    degree: "Double Major, Electrical Engineering",
    institution: "Indian Institute of Technology Kanpur",
    location: "Kanpur, India",
    period: "Jul 2023 — Jun 2024",
    detail: "CPI 9.5 / 10.0",
    href: "https://www.iitk.ac.in/",
  },
  {
    degree: "Bachelor of Technology, Mechanical Engineering",
    institution: "Indian Institute of Technology Kanpur",
    location: "Kanpur, India",
    period: "Jul 2019 — Jun 2023",
    detail: "CPI 9.0 / 10.0",
    href: "https://www.iitk.ac.in/",
  },
];

export const roles: Role[] = [
  {
    org: "Samsung Research Institute Bangalore",
    title: "Senior Engineer",
    unit: "AI Visual Processing Lab",
    location: "Bangalore, India",
    start: "2024-08",
    period: "Aug 2024 — present",
    points: [
      "Core AI-based proposals for video codec standards beyond Versatile Video Coding.",
      "Hardware-friendly neural architectures for AI-based in-loop filters and intra-frame prediction in VVC.",
      "On-device models optimised for real-time processing and efficient codec integration at the edge.",
      "Open-source codecs: Advanced Professional Video (APV) and eXtra Essential Video (XEVC), including the intrinsic optimisations behind APV’s adoption in FFmpeg.",
    ],
  },
  {
    org: "Indian Institute of Science, Bangalore",
    title: "Project Associate",
    unit: "Robert Bosch Centre for Cyber-Physical Systems, with Prof. Ravi Prakash",
    location: "Bangalore, India",
    start: "2024-02",
    period: "Feb 2024 — Jun 2024",
    points: [
      "Imitation learning from imperfect demonstrations across diverse robotic dynamics.",
      "Computed feasibility and optimality scores for each state–action pair in suboptimal human demonstrations.",
      "Trained behaviour-cloning and inverse reinforcement learning models on the refined demonstration subsets.",
      "Simulated on a KUKA industrial arm in Gazebo and Gym, then deployed an end-effector trajectory planning pipeline on the physical arm.",
    ],
  },
  {
    org: "ITC Ltd.",
    title: "Techno-manager",
    unit: "Food Business Division",
    location: "Bangalore, India",
    start: "2023-05",
    period: "May 2023",
    points: [
      "On the KITES internship: research into cold grinding of wheat and its nutritional advantages over conventionally milled flour.",
    ],
  },
  {
    org: "Indian Institute of Technology Kanpur",
    title: "Project Associate",
    unit: "Intelligent Systems and Controls Lab, with Prof. Laxmidhar Behera",
    location: "Kanpur, India",
    start: "2021-07",
    period: "Jul 2021 — Jan 2022",
    points: [
      "Built an unmanned excavator with a 2-DOF arm for remote terrain inspection and data collection.",
      "Integrated gas, microphone and vision sensors, with fusion algorithms for visual-acoustic analysis.",
      "Designed the electronics architecture: power management, actuators and arm control.",
      "Formulated the decision algorithms for BIRAC’s brain-controlled wheelchair, driven by an Ultracortex Mark IV EEG headset.",
    ],
  },
];

export const publications: Publication[] = [
  {
    title:
      "A cyber-physical system based unmanned ground vehicles for safety inspection and rescue support in an underground mine",
    venue: "International Journal of Intelligent Unmanned Systems",
    year: 2025,
    kind: "Journal",
    url: "https://doi.org/10.1108/IJIUS-07-2024-0202",
    citation:
      "L. Behera, S. Agarwal, T. Sandhan, P. Sharma, A. Kumar, A. Ranjan, S. Watsa, et al. International Journal of Intelligent Unmanned Systems, vol. 13, no. 1, pp. 92–128, Feb. 2025.",
    abstract:
      "A robot designed to map underground mine environments, built around a computational-intelligence cyber-physical framework for mining operations. It navigates semi-autonomously without GNSS, fusing a sensor suite into an architecture capable of data acquisition and navigation in challenging underground conditions — improving safety inspection, emergency rescue and assistance to miners in hazardous environments.",
  },
  {
    title:
      "Towards autonomous shooting rover via situation aware visual-perception and dynamic action execution",
    venue: "IEEE/SICE International Symposium on System Integration (SII)",
    year: 2024,
    kind: "Conference",
    url: "https://ieeexplore.ieee.org/abstract/document/10417488/",
    citation:
      "S. Chikoti, Y. Seelam, A. Jain, N. Mehta, S. Watsa, et al. 2024 IEEE/SICE International Symposium on System Integration, Ha Long, Vietnam, 2024, pp. 1113–1118.",
    abstract:
      "Our approach to the DJI RoboMaster AI Challenge 2022, where team ERA-IITK placed third worldwide. The paper details the hardware infrastructure and the algorithmic pipeline, with a state machine built on top to reach full autonomy. The novelty is a high-speed, accurate visual perception module for target detection paired with fast self-localisation, maximising the likelihood of a target being hit.",
  },
];

export const patents: Patent[] = [
  {
    title:
      "Inverted-L-scan method for AI-based intra-frame prediction in a video codec",
    applicationNo: "202541023751",
    summary:
      "A pre- and post-processing method using an inverted L-scan order to prepare neighbouring pixels for a unified AI-based intra prediction model, preserving inter-pixel correlation in next-generation codecs and improving coding efficiency.",
  },
  {
    title:
      "Methods and system for AI-based pixel-block prediction for a video codec",
    applicationNo: "202541024348",
    summary:
      "A unified, low-complexity neural architecture for intra prediction with multi-scale CNN blocks, leveraging neighbouring reference lines to predict coding units, optimised for efficient hardware implementation.",
  },
];

export const projects: Project[] = [
  {
    title: "End-to-end NNLF decoder inference in Halide",
    affiliation: "Samsung Research Bangalore",
    points: [
      "Investigated whether kernel-level optimisation could meet the decoder-side hardware realisability constraint.",
      "Optimised single-core x86 inference of a MAC-bound model using Halide vectorisation, cache locality and scheduling.",
      "Designed modular Halide generators composing every NN operation into a unified float32 and int16 quantised pipeline.",
      "Delivered 130% decoder complexity against 600% for SADL, down to 115% multicore — ready for the post-VVC call for proposals in 2027.",
    ],
  },
  {
    title: "AI-based in-loop filters",
    affiliation: "Samsung Research Bangalore",
    points: [
      "Designed a low-complexity neural network for suppressing compression and banding artefacts.",
      "Combined handcrafted filters with NNLF, trained on DIV2K, scaled and blended with the deblocking output.",
      "Delivered state-of-the-art Bjøntegaard Delta Bitrate gains at ultra-low complexity — under 1k MAC/pixel.",
      "Integrated the model into the VVC Test Model, with C++ inference through optimised SADL.",
    ],
  },
  {
    title: "AI-based intra-frame prediction",
    affiliation: "Samsung Research Bangalore",
    points: [
      "Examined whether a single neural model could replace seven post-VVC intra predictors across coding unit sizes.",
      "Designed an input preprocessing stage that retains strong inter-pixel correlation in reference regions.",
      "Developed a unified model of multi-scale CNN blocks adaptable to differing spatial resolutions.",
      "Integrated the NN-based mode alongside classical predictors in post-VVC, with SADL inference.",
    ],
  },
  {
    title: "Open Advanced Professional Video codec (APV)",
    affiliation: "Samsung Research Bangalore",
    points: [
      "Contributed core algorithms to APV, an open-source, perceptually lossless professional codec.",
      "Optimised the DCT transform and quantisation using platform intrinsics — NEON and AVX.",
      "Brought APV plugins to FFmpeg, ultrasound edge devices and Premiere Pro for NAB demonstrations.",
      "Integrated the codec end to end on Samsung edge devices for a Samsung Developer Conference demo.",
    ],
  },
  {
    title: "IEEE DJI RoboMaster AI Challenge",
    affiliation: "IIT Kanpur, with Prof. Laxmidhar Behera",
    points: [
      "Engineered two autonomous robots for intelligent shooting in a dynamic arena.",
      "Adapted YOLO-v5 for armour-plate detection at roughly 85% mAP and 90% shooting accuracy.",
      "Built motion planning and localisation from visual marker detection combined with rf2o laser odometry.",
      "Deployed YOLO-v5 on outpost camera feeds via DarkNet for global robot and opponent localisation.",
    ],
  },
  {
    title: "ISRO Chandrayaan moon mapping challenge",
    affiliation: "Inter-IIT Tech Meet",
    points: [
      "Trained a network to produce high-resolution lunar terrain from medium- and low-resolution inputs.",
      "Processed TMC and OHRC imagery into ortho-corrected rectangular patches for training.",
      "Cascaded SRGAN with a Shifted Window Transformer (SwinIR) to reach 16× upscaling.",
      "Reached an SSIM of 0.71 against the high-resolution OHRC reference imagery.",
    ],
  },
];

export const honours: string[] = [
  "Third globally in the IEEE ICRA DJI RoboMaster AI Challenge 2022, among 40+ teams.",
  "Talent Transformer’s Award, 2025, for contributions to teaching at Samsung Research.",
  "Academic Excellence Award, twice (2020–21 and 2022–23), for standing in the top 10% of the cohort.",
];

export const teaching: Teaching[] = [
  {
    title: "Fundamentals of device drivers",
    invitedBy: "Invited by the Learning and Development team",
    venue: "Samsung Research Institute Bangalore",
    location: "Bangalore, India",
    period: "Oct 2025 — Dec 2025",
    points: [
      "Interactive sessions on device-driver fundamentals through Linux kernel programming on a Raspberry Pi.",
      "Recognised with the Talent Transformer’s Award, 2025.",
    ],
  },
  {
    title: "Foundations of Design Practicum",
    invitedBy: "Invited by Prof. Laxmidhar Behera, Director",
    venue: "Indian Institute of Technology Mandi",
    location: "Mandi, Himachal Pradesh, India",
    period: "May 2022 — Jul 2022",
    points: [
      "Designed an institute-wide compulsory interdisciplinary course on building a robot from scratch.",
      "Ran a 30-day workshop training the teaching assistants who would deliver it.",
    ],
  },
];

export const skills = [
  "C++",
  "C",
  "Python",
  "Halide",
  "Embedded C",
  "On-device AI",
  "PyTorch",
  "TensorFlow",
  "OpenCV",
  "OpenAPV",
  "SADL",
  "DarkNet",
  "NEON",
  "AVX",
  "FFmpeg",
  "ROS",
  "Gazebo",
];
