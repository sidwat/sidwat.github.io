# Current website wording — review companion

Captured 26 October 2026 from commit `22d4e9d`. This is an exact-copy source snapshot, not a proposed rewrite. Read it alongside [the professor review](2026-10-26-professor-review.md). No website text is changed.

Primary CV: `public/cv.pdf`, two pages, PDF metadata dated 18 August 2026. SHA-256: `8b0506ee2a085f7f3eaff6ddfc8123329f01f05be794f35926e6202f5b8d1b0e`. PDF timestamps identify the file, not an assurance that every CV fact is up to date.

Sources: `lib/content.ts`, `lib/site.ts`, page headers under `app/`, `components/Hero.tsx`, `components/ProjectCard.tsx`, and the blog/contact copy dictionaries. Data-only fields are labelled below; draft blog fixtures are not public writing.

## Home: name, eyebrow and biography

> Sidhartha Watsa

> MS Computer Science · UC San Diego

> I am interested in robots and vision. I spent two years at Samsung Research on next-generation video codecs — the work of making video smaller. Before that, imitation learning at IISc Bangalore, and mechanical engineering with a double major in electrical at IIT Kanpur.

Hero links: **View CV** and **Download PDF**, both targeting `/cv.pdf`. The identity line repeats the name and eyebrow.

## Home: about

> I was born in a small beautiful town, Jamshedpur in India. I pursued a Bachelor of Technology in Mechanical Engineering with a double major in Electrical Engineering from IIT Kanpur. My research interests lie in computer vision, robotics, deep learning, embedded systems and mathematics generally. In college I led team ERA, a group focused on real-time autonomous systems. After finishing my coursework I joined the Robert Bosch Centre for Cyber-Physical Systems at IISc Bangalore, where I worked on imitation learning. I then joined Samsung Research Institute Bangalore, where I spent two years on next-generation video codec standards in the AI Visual Processing Lab. I am now reading for a master’s in computer science at UC San Diego.

Links in the paragraph: [IIT Kanpur](https://www.iitk.ac.in/), [team ERA](https://era.sntiitk.com/), [Robert Bosch Centre for Cyber-Physical Systems](https://cps.iisc.ac.in/), [IISc Bangalore](https://iisc.ac.in/), [Samsung Research Institute Bangalore](https://research.samsung.com/sri-b), [UC San Diego](https://cse.ucsd.edu/).

## Research interests

> - Robotic perception
> - 3D vision
> - Efficient and on-device AI
> - Hardware–software co-design
> - Imitation learning


## Education


### University of California, San Diego — Master of Science, Computer Science

> Sep 2026 — present

Institution link: https://cse.ucsd.edu/


### Indian Institute of Technology Kanpur — Double Major, Electrical Engineering

> Jul 2023 — Jun 2024

> CPI 9.5 / 10.0

Institution link: https://www.iitk.ac.in/


### Indian Institute of Technology Kanpur — Bachelor of Technology, Mechanical Engineering

> Jul 2019 — Jun 2023

> CPI 9.0 / 10.0

Institution link: https://www.iitk.ac.in/


## Experience


### Samsung Research Institute Bangalore — Senior Engineer

> Aug 2024 — Aug 2026 · AI Visual Processing Lab · Bangalore, India

> - Core AI-based proposals for video codec standards beyond Versatile Video Coding.
> - Hardware-friendly neural architectures for AI-based in-loop filters and intra-frame prediction in VVC.
> - On-device models optimised for real-time processing and efficient codec integration at the edge.
> - Open-source codecs: Advanced Professional Video (APV) and eXtra Essential Video (XEVC), including the intrinsic optimisations behind APV’s adoption in FFmpeg.


### Indian Institute of Science, Bangalore — Project Associate

> Feb 2024 — Jun 2024 · Robert Bosch Centre for Cyber-Physical Systems, with Prof. Ravi Prakash · Bangalore, India

> - Imitation learning from imperfect demonstrations across diverse robotic dynamics.
> - Computed feasibility and optimality scores for each state–action pair in suboptimal human demonstrations.
> - Trained behaviour-cloning and inverse reinforcement learning models on the refined demonstration subsets.
> - Simulated on a KUKA industrial arm in Gazebo and Gym, then deployed an end-effector trajectory planning pipeline on the physical arm.


### ITC Ltd. — Techno-manager

> May 2023 · Food Business Division · Bangalore, India

> - On the KITES internship: research into cold grinding of wheat and its nutritional advantages over conventionally milled flour.


### Indian Institute of Technology Kanpur — Project Associate

> Jul 2021 — Jan 2022 · Intelligent Systems and Controls Lab, with Prof. Laxmidhar Behera · Kanpur, India

> - Built an unmanned excavator with a 2-DOF arm for remote terrain inspection and data collection.
> - Integrated gas, microphone and vision sensors, with fusion algorithms for visual-acoustic analysis.
> - Designed the electronics architecture: power management, actuators and arm control.
> - Formulated the decision algorithms for BIRAC’s brain-controlled wheelchair, driven by an Ultracortex Mark IV EEG headset.


## Projects and selected-work cards

The Home page selects the first three entries below. Each card uses its project title and the first bullet verbatim, then “View project”. All four bullets appear on the individual project page.


### End-to-end NNLF decoder inference in Halide

Route: `/projects/nnlf-halide/`

> Samsung Research Bangalore

> - Investigated whether kernel-level optimisation could meet the decoder-side hardware realisability constraint.
> - Optimised single-core x86 inference of a MAC-bound model using Halide vectorisation, cache locality and scheduling.
> - Designed modular Halide generators composing every NN operation into a unified float32 and int16 quantised pipeline.
> - Delivered 130% decoder complexity against 600% for SADL, down to 115% multicore — ready for the post-VVC call for proposals in 2027.


### AI-based in-loop filters

Route: `/projects/neural-loop-filters/`

> Samsung Research Bangalore

> - Designed a low-complexity neural network for suppressing compression and banding artefacts.
> - Combined handcrafted filters with NNLF, trained on DIV2K, scaled and blended with the deblocking output.
> - Delivered state-of-the-art Bjøntegaard Delta Bitrate gains at ultra-low complexity — under 1k MAC/pixel.
> - Integrated the model into the VVC Test Model, with C++ inference through optimised SADL.


### AI-based intra-frame prediction

Route: `/projects/neural-intra-prediction/`

> Samsung Research Bangalore

> - Examined whether a single neural model could replace seven post-VVC intra predictors across coding unit sizes.
> - Designed an input preprocessing stage that retains strong inter-pixel correlation in reference regions.
> - Developed a unified model of multi-scale CNN blocks adaptable to differing spatial resolutions.
> - Integrated the NN-based mode alongside classical predictors in post-VVC, with SADL inference.


### Open Advanced Professional Video codec (APV)

Route: `/projects/apv/`

> Samsung Research Bangalore

> - Contributed core algorithms to APV, an open-source, perceptually lossless professional codec.
> - Optimised the DCT transform and quantisation using platform intrinsics — NEON and AVX.
> - Brought APV plugins to FFmpeg, ultrasound edge devices and Premiere Pro for NAB demonstrations.
> - Integrated the codec end to end on Samsung edge devices for a Samsung Developer Conference demo.


### IEEE DJI RoboMaster AI Challenge

Route: `/projects/robomaster/`

> IIT Kanpur, with Prof. Laxmidhar Behera

> - Engineered two autonomous robots for intelligent shooting in a dynamic arena.
> - Adapted YOLO-v5 for armour-plate detection at roughly 85% mAP and 90% shooting accuracy.
> - Built motion planning and localisation from visual marker detection combined with rf2o laser odometry.
> - Deployed YOLO-v5 on outpost camera feeds via DarkNet for global robot and opponent localisation.


### ISRO Chandrayaan moon mapping challenge

Route: `/projects/chandrayaan/`

> Inter-IIT Tech Meet

> - Trained a network to produce high-resolution lunar terrain from medium- and low-resolution inputs.
> - Processed TMC and OHRC imagery into ortho-corrected rectangular patches for training.
> - Cascaded SRGAN with a Shifted Window Transformer (SwinIR) to reach 16× upscaling.
> - Reached an SSIM of 0.71 against the high-resolution OHRC reference imagery.

Current card media: the Halide card uses an alpine landscape; the loop-filter card uses an original/compressed bird comparison; the intra-prediction card uses a painting. Each is labelled **Illustrative image**. Other cards use project-word placeholders. These are not automatically experimental outputs.

## Publications


### A cyber-physical system based unmanned ground vehicles for safety inspection and rescue support in an underground mine

> 2025 · Journal · International Journal of Intelligent Unmanned Systems

> A robot designed to map underground mine environments, built around a computational-intelligence cyber-physical framework for mining operations. It navigates semi-autonomously without GNSS, fusing a sensor suite into an architecture capable of data acquisition and navigation in challenging underground conditions — improving safety inspection, emergency rescue and assistance to miners in hazardous environments.

> L. Behera, S. Agarwal, T. Sandhan, P. Sharma, A. Kumar, A. Ranjan, S. Watsa, et al. International Journal of Intelligent Unmanned Systems, vol. 13, no. 1, pp. 92–128, Feb. 2025.

Paper link: https://doi.org/10.1108/IJIUS-07-2024-0202


### Towards autonomous shooting rover via situation aware visual-perception and dynamic action execution

> 2024 · Conference · IEEE/SICE International Symposium on System Integration (SII)

> Our approach to the DJI RoboMaster AI Challenge 2022, where team ERA-IITK placed third worldwide. The paper details the hardware infrastructure and the algorithmic pipeline, with a state machine built on top to reach full autonomy. The novelty is a high-speed, accurate visual perception module for target detection paired with fast self-localisation, maximising the likelihood of a target being hit.

> S. Chikoti, Y. Seelam, A. Jain, N. Mehta, S. Watsa, et al. 2024 IEEE/SICE International Symposium on System Integration, Ha Long, Vietnam, 2024, pp. 1113–1118.

Paper link: https://ieeexplore.ieee.org/abstract/document/10417488/


## Patent applications

The current page heading is “Patents filed”. These are application numbers, not evidence of grants.


### Hybrid AI Loop Filter for Video Codec with Hardware-Friendly Model Selection

> 202541087044

> Encodes video with a lightweight AI-based in-loop filter (ILF) that selects a handcrafted filter (the ‘secret sauce’) and a downscale level (1×–8×) based on reconstruction error and video content. It then loads the matching pretrained neural-network weights from a lookup table using a signaled index. This keeps AI filtering content-adaptive while keeping the hardware structure fixed; only on/off switches and weight loading change.


### Inverted-L-scan method for AI-based intra-frame prediction in a video codec

> 202541023751

> A pre- and post-processing method using an inverted L-scan order to prepare neighbouring pixels for a unified AI-based intra prediction model, preserving inter-pixel correlation in next-generation codecs and improving coding efficiency.


### Methods and system for AI-based pixel-block prediction for a video codec

> 202541024348

> A unified, low-complexity neural architecture for intra prediction with multi-scale CNN blocks, leveraging neighbouring reference lines to predict coding units, optimised for efficient hardware implementation.


## Recognition

> - Third globally in the IEEE ICRA DJI RoboMaster AI Challenge 2022, among 40+ teams.
> - Talent Transformer’s Award, 2025, for contributions to teaching at Samsung Research.
> - Academic Excellence Award, twice (2020–21 and 2022–23), for standing in the top 10% of the cohort.


## Teaching


### Fundamentals of device drivers

> Oct 2025 — Dec 2025 · Samsung Research Institute Bangalore · Bangalore, India · Invited by the Learning and Development team

> - Interactive sessions on device-driver fundamentals through Linux kernel programming on a Raspberry Pi.
> - Recognised with the Talent Transformer’s Award, 2025.


### Foundations of Design Practicum

> May 2022 — Jul 2022 · Indian Institute of Technology Mandi · Mandi, Himachal Pradesh, India · Invited by Prof. Laxmidhar Behera, Director

> - Designed an institute-wide compulsory interdisciplinary course on building a robot from scratch.
> - Ran a 30-day workshop training the teaching assistants who would deliver it.


## Skills inventory — defined in source, not currently rendered as a page section

> - C++
> - C
> - Python
> - Halide
> - Embedded C
> - On-device AI
> - PyTorch
> - TensorFlow
> - OpenCV
> - OpenAPV
> - SADL
> - DarkNet
> - NEON
> - AVX
> - FFmpeg
> - ROS
> - Gazebo

This array is included for completeness and comparison with the CV; it must not be mistaken for a visible Skills section.

## Page header copy


### app/experience/page.tsx

**label**

> Where I have worked

**title**

> Experience

**intro**

> Research roles across video coding, imitation learning, and autonomous systems.


### app/publications/page.tsx

**label**

> Papers, patents and standards

**title**

> Publications

**intro**

> Peer-reviewed work, filed patents, and contributions to video coding standards.


### app/projects/page.tsx

**label**

> Selected work

**title**

> Projects

**intro**

> Codec research at Samsung, and autonomous systems before it.


### app/teaching/page.tsx

**label**

> Teaching and invited instruction

**title**

> Teaching

**intro**

> Courses and workshops I have designed and taught.


### app/gallery/page.tsx

**label**

> Photographs

**title**

> Gallery

**intro**

> Pictures taken away from the screen.


## Blog copy — fixtures are drafts, not published articles

**blog.meta.description**

> Notes on compression, vision, and the occasional detour.

**blog.index.label**

> Writing

**blog.index.title**

> Blog

**blog.index.intro**

> Notes on compression, vision, and the occasional detour.

**blog.index.empty.label**

> No entries

**blog.index.empty.body**

> Nothing published yet. The first post is in progress.

**blog.index.empty.cta**

> Write a message

**blog.index.rss.label**

> Subscribe

**blog.index.rss.link**

> RSS feed


## Contact copy

These are interface strings; some appear only in their corresponding success/error state. The report proposes an introduction alternative, not changes to every functional message.

**contact.unconfigured**

> Please email me directly using the address below.

**contact.meta.title**

> Contact

**contact.meta.description**

> Send Sidhartha Watsa a message about anything.

**contact.label**

> Contact

**contact.title**

> Get in touch

**contact.intro**

> Write to me about anything: research, a collaboration, a correction, a question about a post.

**contact.field.name.label**

> Name

**contact.field.email.label**

> Email

**contact.field.subject.label**

> Subject

**contact.field.message.label**

> Message

**contact.field.optional**

> (optional)

**contact.counter.text**

> {n} / 5,000

**contact.counter.status.warn**

> {n} characters left

**contact.counter.status.limit**

> Character limit reached

**contact.consent**

> Messages go through a third-party form service to my inbox, and the service may keep a copy for a short time. I use what you send only to reply to you.

**contact.submit**

> Send message

**contact.submit.busy**

> Sending…

**contact.submit.retry**

> Try again

**contact.status.sending**

> Sending your message

**contact.status.slow**

> Still sending… this is taking longer than usual.

**contact.error.prefix**

> Error:

**contact.error.name.required**

> Enter your name.

**contact.error.name.long**

> Use 100 characters or fewer.

**contact.error.email.required**

> Enter your email so I can reply.

**contact.error.email.invalid**

> Enter an email like name@example.com

**contact.error.email.long**

> Use 254 characters or fewer.

**contact.error.subject.long**

> Use 150 characters or fewer.

**contact.error.message.required**

> Write a message.

**contact.error.message.short**

> Write at least 10 characters.

**contact.error.message.long**

> Use 5,000 characters or fewer.

**contact.summary.title.one**

> Fix 1 field before sending

**contact.summary.title.many**

> Fix {n} fields before sending

**contact.summary.item**

> {label}: {message}

**contact.fail.title**

> Message not sent

**contact.fail.network**

> Could not reach the message service. Your message is still here: check your connection and press Try again, or email me directly.

**contact.fail.provider**

> The message service had a problem. Your message is still here: press Try again in a moment, or email me directly.

**contact.fail.rate**

> Too many messages right now. Try again later or email me directly. Your message is still here.

**contact.fail.spam**

> The spam filter held this message back. Check it for links, wait a few seconds, then press Try again, or email me directly.

**contact.fail.validation**

> The service rejected something in the form. Check your entries and press Try again, or email me directly.

**contact.fail.mailto**

> Email me instead

**contact.fail.mailto.toolong**

> Your message is too long to prefill. It is still in the box: copy it into your email.

**contact.success.title**

> Message sent

**contact.success.body**

> Thanks — I read everything and reply from {email}.

**contact.success.again**

> Send another

**contact.success.home**

> Back to home

**contact.alt**

> Or email {email}

**contact.noscript**

> The contact form needs JavaScript to run. You can still email me at {email}.

**contact.mailto.subject**

> Message from sidwat.github.io

**contact.honeypot**

> (none)


## Footer and public identity

**name**

> Sidhartha Watsa

**role**

> Research Engineer

**employer**

> UC San Diego

**location**

> San Diego

**email**

> swatsa@ucsd.edu

**url**

> https://sidwat.github.io

**nav.aria**

> Sections

**footer.elsewhere**

> Elsewhere

**footer.touch**

> Get in touch

**footer.write**

> Write a message

**footer.copyright**

> © {year} {name}

Other footer link: **Motion studies** (`/motion-studies/`). The copyright year and name placeholders are filled at render time.

- [GitHub](https://github.com/sidwat)
- [LinkedIn](https://www.linkedin.com/in/sidhartha-watsa)
- [Google Scholar](https://scholar.google.com/citations?user=HoIkFUgAAAAJ&hl=en)
- [ORCID](https://orcid.org/0009-0003-3888-0736)
