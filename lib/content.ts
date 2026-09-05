/**
 * Content ported from the Jekyll site in `_legacy-jekyll/`.
 *
 * Everything here is real material that was already published; nothing is
 * invented. Kept as typed data rather than MDX so the pages stay simple and a
 * later move to a CMS is a change of source, not of rendering.
 *
 * Dates come from the Jekyll front matter, which recorded a single date per
 * entry rather than a range — so these are start years and there are no end
 * dates to show.
 */

export type Segment = { text: string; href?: string };

export type Role = {
  org: string;
  title: string;
  /** Lab, centre or division within the organisation. */
  unit?: string;
  location: string;
  /** ISO date from the legacy front matter; used for ordering. */
  start: string;
  summary: string;
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

export type Project = {
  title: string;
  affiliation: string;
  points: string[];
};

export type Teaching = {
  title: string;
  kind: string;
  venue: string;
  location: string;
  summary: string;
  topics: string[];
};

export type Education = {
  degree: string;
  institution: string;
  href?: string;
};

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
    text: ", where I contribute to next-generation video codec standards in the AI Video Processing Lab.",
  },
];

export const education: Education[] = [
  {
    degree:
      "B.Tech, Mechanical Engineering — double major in Electrical Engineering",
    institution: "Indian Institute of Technology Kanpur",
    href: "https://www.iitk.ac.in/",
  },
];

export const roles: Role[] = [
  {
    org: "Samsung Research Institute Bangalore",
    title: "Senior Engineer",
    unit: "AI Video Processing Lab",
    location: "Bangalore, India",
    start: "2024-07-29",
    summary:
      "Next-generation AI-based video codecs: contributions to post-VVC standards and to the open-source Advanced Professional Video codec.",
  },
  {
    org: "Robert Bosch Centre for Cyber-Physical Systems, IISc Bangalore",
    title: "Project Associate",
    location: "Bangalore, India",
    start: "2024-02-02",
    summary:
      "Learning for the KUKA robot from imperfect demonstrations — those that are either infeasible or sub-optimal.",
  },
  {
    org: "ITC Ltd.",
    title: "Techno-manager",
    unit: "Food Business Division",
    location: "Bangalore, India",
    start: "2023-05-19",
    summary:
      "On the KITES internship: research into cold grinding of wheat and its nutritional advantages over conventionally milled flour.",
  },
  {
    org: "Indian Institute of Technology Kanpur",
    title: "Student Research Associate",
    unit: "Intelligent Systems and Controls Lab",
    location: "Kanpur, India",
    start: "2022-01-01",
    summary:
      "An unmanned autonomous vehicle for underground mine excavation, and a brain-controlled wheelchair driven by an Ultra-Cortex Mark IV EEG headset.",
  },
];

export const publications: Publication[] = [
  {
    title:
      "A cyber-physical system based unmanned ground vehicle for safety inspection and rescue support in an underground mine",
    venue: "International Journal of Intelligent Unmanned Systems",
    year: 2025,
    kind: "Journal",
    url: "https://doi.org/10.1108/IJIUS-07-2024-0202",
    citation:
      "Behera L, Agarwal S, Sandhan T, Sharma P, Kumar A, Ranjan A, Watsa S, Singh A, Kasina JS (2025). International Journal of Intelligent Unmanned Systems, Vol. 13 No. 1, pp. 92–128.",
    abstract:
      "A robot designed to map underground mine environments, built around a computational-intelligence cyber-physical framework for mining operations. It navigates semi-autonomously without GNSS, fusing a sensor suite into an architecture capable of data acquisition and navigation in challenging underground conditions — improving safety inspection, emergency rescue and assistance to miners in hazardous environments.",
  },
  {
    title:
      "Towards Autonomous Shooting Rover via Situation Aware Visual-Perception and Dynamic Action Execution",
    venue: "IEEE/SICE International Symposium on System Integration (SII)",
    year: 2024,
    kind: "Conference",
    url: "https://ieeexplore.ieee.org/abstract/document/10417488/",
    citation:
      "S. Chikoti et al. (2024). 2024 IEEE/SICE International Symposium on System Integration, Ha Long, Vietnam, pp. 1113–1118. doi:10.1109/SII58957.2024.10417488.",
    abstract:
      "Our approach to the DJI RoboMaster AI Challenge 2022, where team ERA-IITK placed 3rd worldwide among 83 teams. The paper details the hardware infrastructure and the algorithmic pipeline, with a state machine built on top to reach full autonomy. The novelty is a high-speed, accurate visual perception module for target detection paired with fast self-localisation, maximising the likelihood of a target being hit.",
  },
];

export const projects: Project[] = [
  {
    title: "AI-based in-loop filters",
    affiliation: "Samsung Research Bangalore",
    points: [
      "Designed a low-complexity neural network for suppressing compression and banding artefacts.",
      "Combined artefact-aware handcrafted filters with NN-based loop filters, trained on DIV2K.",
      "Introduced a scaling and signalling framework letting the NN filter operate alongside the deblocking filter.",
      "Delivered state-of-the-art Bjøntegaard Delta Bitrate gains at ultra-low complexity, under 5k MAC/pixel.",
      "Integrated the model into the VVC Test Model, with C++ inference through optimised SADL.",
    ],
  },
  {
    title: "AI-based intra-frame prediction",
    affiliation: "Samsung Research Bangalore",
    points: [
      "Built a unified AI-driven intra-frame prediction method covering multiple coding unit sizes.",
      "Designed an input preprocessing stage that retains inter-pixel correlation in reference regions.",
      "Developed a unified model of multi-scale CNN blocks adaptable to differing spatial resolutions.",
      "Integrated the NN-based prediction mode alongside classical predictors in post-VVC, with C++ inference.",
      "Delivered coding efficiency gains from a single model, replacing seven separate post-VVC variants.",
    ],
  },
  {
    title: "Open Advanced Professional Video codec (APV)",
    affiliation: "Samsung Research Bangalore",
    points: [
      "Contributed core algorithms to APV, an open-source, perceptually lossless professional codec.",
      "Optimised the DCT2 transform and quantisation using platform intrinsics — NEON and AVX.",
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
      "Built motion planning and localisation from visual marker detection combined with laser odometry.",
      "Deployed YOLO-v5 on camera feeds via DarkNet for global robot and opponent localisation.",
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

export const teaching: Teaching[] = [
  {
    title: "Embedded Systems Programming in C",
    kind: "Lecture course",
    venue: "Learning and Development, Samsung Research Institute Bangalore",
    location: "Bangalore, India",
    summary:
      "Device-driver programming principles in C for embedded systems, oriented around Samsung camera devices.",
    topics: [
      "Device drivers and Linux source",
      "Interrupt handling",
      "Kernel threads",
    ],
  },
  {
    title: "Foundations of Design Practicum",
    kind: "Workshop",
    venue: "Indian Institute of Technology Mandi",
    location: "Mandi, India",
    summary:
      "Designed and launched for an incoming cohort: a multi-disciplinary grounding in how to build a robot from scratch.",
    topics: [
      "Mechanical chassis design, CAD and fabrication",
      "Robot Operating System",
      "Electronics — microcontrollers, compute, drivers",
    ],
  },
];
