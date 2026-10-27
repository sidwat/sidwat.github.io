# Professor-style review of the current portfolio, with proposed alternatives

Date: 26 October 2026. Decision: **NEEDS FACTS for several claims; REVISE for presentation.** This is a simulated academic and technical hiring review, not an endorsement by a university or employer. The website itself has not been edited by this report.

## 1. What I read and how to interpret this report

I read the complete extracted text of the two-page `public/cv.pdf` (`/tmp/sidwat-website-cv.txt`), including its metric footnotes, research projects, two publications, two patent applications, teaching, education and skills. I compared it with `lib/content.ts`, `lib/site.ts`, `components/Hero.tsx`, `components/ProjectCard.tsx`, `components/Footer.tsx`, all principal page components under `app/`, contact and blog copy, and both Markdown blog fixtures. The PDF metadata supplied with the review identifies an August 2026 document; that explains some potentially stale language, but does not resolve the discrepancies. Source references below are repository paths, routes or CV page numbers so the recommendations can be checked.

“Source-supported” means that a statement appears in the supplied CV and/or current website. It does **not** mean that I independently verified the result, publication, patent registry, employment dates or competition record. I did not browse those external records. Proposed passages are editorial drafts, not new biographical evidence. Questions marked “confirm” must be settled before publishing the affected sentence.

The [complete current-copy companion](2026-10-26-current-text.md) preserves the original text separately. The original passages below reproduce the current website wording. For long items I reproduce all substantive bullets or explicitly identify an excerpt. The proposed alternatives deliberately omit unsupported superlatives and causal claims. They should not silently replace authentic paper or patent titles. The CV is an essential cross-check, but its “Present” and “Incoming” labels also need updating rather than being treated as permanently authoritative.

## 2. The professor's assessment

There is a credible and unusually practical profile here: mechanical and electrical engineering, robot systems, imitation learning, neural video coding, and low-level inference optimisation. The Halide experiment is especially valuable because it asks a concrete feasibility question and reports a result against a baseline. The robotics work could establish a second strong line of evidence through the physical-arm pipeline, competition system and peer-reviewed papers.

The current site makes the reader reconstruct this argument. Most project pages are four CV bullets without an experimental setup, a figure, individual contribution boundaries or a link to inspect the work. A professor cannot yet distinguish an excellent engineering contribution from participation in a large group. A recruiter can identify relevant tools but cannot consistently tell which system you owned or what changed because of your work.

My strongest recommendation is to organise the portfolio around **efficient machine learning and embodied systems**, using that phrase only as an editorial grouping of existing work. Do not invent a future research programme to connect every past experience. Your next draft should say what you actually want to investigate now; the site can then prioritise supporting projects accordingly.

### Priority decisions

1. Resolve current affiliation and dates across the website, CV and structured metadata. A stale CV linked twice from the hero weakens trust immediately.
2. Define the Halide timing ratios and qualify the in-loop-filter comparison. These are your strongest numerical claims and currently the easiest to misunderstand.
3. Separate your work from team outcomes, especially RoboMaster ranking, APV adoption and institutional course design.
4. Replace generic project images with explanatory evidence. Keep illustrative labels until genuine outputs are available.
5. Build three substantive case studies before expanding decorative features: Halide, imitation learning, and RoboMaster or APV depending on the audience.
6. Preserve the other projects as concise entries until their evidence is ready. A short, precise page is stronger than a long page with invented detail.

## 3. CV versus website: factual reconciliation

| Issue | CV | Website | Required decision |
|---|---|---|---|
| Samsung employment | Aug 2024–Present, p. 1 | Aug 2024–Aug 2026; “spent two years” | Confirm final employment month and whether any continuing appointment exists. |
| UCSD status | MS Computer Science “Incoming”, Sep 2026–Present, p. 1 | Current MS study, Sep 2026–present | Confirm enrolment; update both consistently. |
| Metadata identity | Education names UCSD | `site.role = Research Engineer`, `site.employer = UC San Diego` | Confirm an actual research-engineer appointment; study alone does not establish employment. |
| Open codec name | eXtra Essential Video (XEV) | eXtra Essential Video (XEVC) | Use the project's official name and acronym after checking the relevant artifact. |
| ITC role | Not in supplied CV | Techno-manager, KITES internship, May 2023 | Confirm formal role title, dates and scope; absence from the CV is not evidence that it is false. |
| ERA leadership | CV lists team research and competition work | About says “I led team ERA” | Confirm position, dates, responsibilities and distinction between team membership and leadership. |
| Patent count | Two application numbers, p. 2 | Three, including 202541087044 | Supply the third application's official record and your inventor status; confirm publication/disclosure status. |
| NNLF result | Footnote defines decoder-time ratio | “decoder complexity” without definition | Publish the actual timing definition and comparable conditions. |
| YOLO result | 85% mAP, 90% shooting accuracy | “roughly 85% mAP” | Confirm whether rounding is appropriate and define the evaluation protocols. |

The CV itself includes teaching in October–December 2025 despite August 2026 metadata; there is no chronological conflict there. However, a 2026 document can still carry stale “Incoming” wording after the programme begins. Do not substitute today's date for confirmed employment or enrolment facts.

## 4. Home: original wording and two directions

Sources: `/`, `components/Hero.tsx`, `lib/content.ts` (`hero`, `bio`, `researchInterests`). The current H1 is **“Sidhartha Watsa”**. Keep the name; the content question is the explanatory sentence around it.

### Hero

**Current eyebrow:** “MS Computer Science · UC San Diego”

**Current biography:**

> I am interested in robots and vision. I spent two years at Samsung Research on next-generation video codecs — the work of making video smaller. Before that, imitation learning at IISc Bangalore, and mechanical engineering with a double major in electrical at IIT Kanpur.

**Alternative A — professor-facing, recommended:**

> My work spans efficient neural video coding and autonomous systems. At Samsung Research, I worked on neural filtering, intra prediction and inference optimisation. At IISc Bangalore, I studied imitation learning from imperfect demonstrations. My background is in mechanical and electrical engineering at IIT Kanpur.

This names the technical thread without claiming a new research ambition. Add “I am an MS student in Computer Science at UC San Diego” only after status confirmation. The Samsung past tense depends on confirming the end date; otherwise use a dated role caption rather than suggesting departure.

**Alternative B — recruiter-facing:**

> I build and optimise machine-learning systems, from neural video-codec inference to robot perception and control. My experience includes Halide and C++ optimisation at Samsung Research, imitation learning at IISc Bangalore, and autonomous robot systems at IIT Kanpur.

“Build and optimise” is an editorial summary of the CV, not a claim that every project reached production. Avoid “real-time” in this summary until the relevant latency is documented.

**Current actions:** “View CV” and “Download PDF”. These are functionally different but point to the same document. Suggested primary action: **“Explore selected work”**; secondary: **“View CV”**. A download can remain available beside the CV viewer. This helps a first-time visitor inspect evidence rather than exit immediately.

### About

**Current full paragraph:**

> I was born in a small beautiful town, Jamshedpur in India. I pursued a Bachelor of Technology in Mechanical Engineering with a double major in Electrical Engineering from IIT Kanpur. My research interests lie in computer vision, robotics, deep learning, embedded systems and mathematics generally. In college I led team ERA, a group focused on real-time autonomous systems. After finishing my coursework I joined the Robert Bosch Centre for Cyber-Physical Systems at IISc Bangalore, where I worked on imitation learning. I then joined Samsung Research Institute Bangalore, where I spent two years on next-generation video codec standards in the AI Visual Processing Lab. I am now reading for a master’s in computer science at UC San Diego.

**Alternative A — professional biography:**

> I was born in Jamshedpur, India, and studied mechanical engineering and electrical engineering at IIT Kanpur. My work there included autonomous robot systems and sensor integration. At the Robert Bosch Centre for Cyber-Physical Systems, IISc Bangalore, I worked on imitation learning from imperfect demonstrations and a physical robotic-arm trajectory-planning pipeline. At Samsung Research Institute Bangalore, I worked on neural video coding and efficient inference in the AI Visual Processing Lab.

Append the confirmed UCSD sentence. This version preserves your personal origin and relevant progression without depending on the unconfirmed ERA leadership wording.

**Alternative B — concise, project-centred:**

> My background combines mechanical engineering, electrical engineering and machine learning. I have worked on autonomous robots at IIT Kanpur, imitation learning at IISc Bangalore, and neural video codecs at Samsung Research. Across these projects, my contributions have included perception, sensor integration, model design and low-level inference optimisation.

This is shorter and less chronological. It does not claim that all roles involved all four activities. If leadership is confirmed, add a separate precise sentence: “As [confirmed role] in team ERA during [dates], I was responsible for [specific responsibilities].” Do not publish the bracketed sentence unfinished.

### Research positioning and selected work

**Current tags:** “Robotic perception”, “3D vision”, “Efficient and on-device AI”, “Hardware–software co-design”, “Imitation learning”. These match the CV's interests; interests need not all be established results.

**Alternative A:** retain the five tags under **“Research interests”**, followed by: “My previous work includes robot perception and imitation learning, neural video coding, and inference optimisation.” This distinguishes interests from experience.

**Alternative B:** use **“Areas of work”** with “Neural video coding”, “Efficient inference”, “Robot perception and localisation”, and “Imitation learning”. Retain 3D vision separately as an interest rather than implying a substantial published 3D-vision contribution already shown here.

**Current selected-work heading:** “Selected work”; the cards take the first three Samsung projects. This hides the robotics evidence despite the opening “robots and vision”. For the balanced portfolio choose Halide, RoboMaster and either APV or imitation learning. If adding an IISc case study, it requires new supplied content rather than relabelling an existing project. For a codec role, the current three-project selection can remain appropriate.

Suggested card summaries: **Halide:** “Reducing neural-loop-filter inference cost through scheduling, vectorisation and quantisation.” **RoboMaster:** “Perception and localisation for a two-robot autonomous competition system.” **APV:** “Transform and quantisation optimisation using NEON and AVX.” These state the subject without unsupported novelty claims.

## 5. Experience: complete substantive current bullets and proposed versions

Source: `/experience/`, `lib/content.ts: roles`; CV p. 1.

### Samsung Research Institute Bangalore — Senior Engineer

Current bullets:

> Core AI-based proposals for video codec standards beyond Versatile Video Coding.
> Hardware-friendly neural architectures for AI-based in-loop filters and intra-frame prediction in VVC.
> On-device models optimised for real-time processing and efficient codec integration at the edge.
> Open-source codecs: Advanced Professional Video (APV) and eXtra Essential Video (XEVC), including the intrinsic optimisations behind APV’s adoption in FFmpeg.

Proposed replacement:

> Worked on AI-based proposals for video coding beyond VVC, focusing on neural in-loop filtering and intra-frame prediction. Designed hardware-oriented neural architectures and optimised model inference for codec integration. Contributed to APV through platform-specific transform and quantisation optimisation using NEON and AVX, and worked on FFmpeg integration and device demonstrations.

Confirm which contributions were personally implemented, formal standards submission identifiers, the XEV name, and dates. “Behind APV's adoption” implies a causal commercial/open-source outcome that the supplied record does not establish. Link actual commits or public contributions rather than strengthening that phrase.

### IISc Bangalore — Project Associate

Current bullets:

> Imitation learning from imperfect demonstrations across diverse robotic dynamics.
> Computed feasibility and optimality scores for each state–action pair in suboptimal human demonstrations.
> Trained behaviour-cloning and inverse reinforcement learning models on the refined demonstration subsets.
> Simulated on a KUKA industrial arm in Gazebo and Gym, then deployed an end-effector trajectory planning pipeline on the physical arm.

Proposed replacement:

> Studied imitation learning from imperfect demonstrations with Prof. Ravi Prakash at the Robert Bosch Centre for Cyber-Physical Systems. Computed feasibility and optimality scores for demonstration state–action pairs, then used refined subsets to train behaviour-cloning and inverse reinforcement-learning models. Evaluated the pipeline in Gazebo and Gym using a KUKA-arm simulation and deployed end-effector trajectory planning on a physical robotic arm.

The work is technically concrete, but its value remains unmeasured. Supply the task, scoring method, comparison against unfiltered demonstrations, demonstration count and physical-arm outcome. Do not invent an improvement percentage or assert the scoring method was novel.

### ITC — Techno-manager, Food Business Division

Current bullet:

> On the KITES internship: research into cold grinding of wheat and its nutritional advantages over conventionally milled flour.

Proposed replacement:

> KITES internship investigating cold grinding of wheat and comparison with conventionally milled flour.

Use “nutritional advantages” only if an actual measured outcome is supplied. Confirm whether “Techno-manager” was the official appointment or a description of internship responsibilities. This entry can sit under “Additional experience” for research audiences, with no need to conceal it.

### IIT Kanpur — Project Associate

Current bullets:

> Built an unmanned excavator with a 2-DOF arm for remote terrain inspection and data collection.
> Integrated gas, microphone and vision sensors, with fusion algorithms for visual-acoustic analysis.
> Designed the electronics architecture: power management, actuators and arm control.
> Formulated the decision algorithms for BIRAC’s brain-controlled wheelchair, driven by an Ultracortex Mark IV EEG headset.

Proposed replacement:

> Worked with Prof. Laxmidhar Behera in the Intelligent Systems and Controls Lab on robotic inspection and assistive systems. Developed an unmanned excavator with a two-degree-of-freedom arm, integrated gas, microphone and vision sensors, and designed electronics for power management and actuator control. Separately, formulated decision algorithms for a BIRAC brain-controlled-wheelchair project using an Ultracortex Mark IV EEG headset.

The word “separately” prevents readers from treating these as one platform. Confirm the excavator's relation to the mine-inspection publication, individual versus team responsibilities, and whether the wheelchair work was simulated, bench-tested or physically demonstrated.

## 6. Six project pages: proposed case-study text

Source: `/projects/[slug]/`, `lib/content.ts: projects`; CV pp. 1–2. These drafts use only existing facts. They should gain evidence panels rather than become unsupported longer narratives.

### A. End-to-end NNLF decoder inference in Halide

Current complete bullets:

> Investigated whether kernel-level optimisation could meet the decoder-side hardware realisability constraint.
> Optimised single-core x86 inference of a MAC-bound model using Halide vectorisation, cache locality and scheduling.
> Designed modular Halide generators composing every NN operation into a unified float32 and int16 quantised pipeline.
> Delivered 130% decoder complexity against 600% for SADL, down to 115% multicore — ready for the post-VVC call for proposals in 2027.

Proposed:

> **Question.** Could kernel-level optimisation make neural-loop-filter inference practical within the decoder's compute constraints?
>
> **My work.** I built modular Halide generators for the network operations and composed float32 and int16 inference pipelines. I optimised single-core x86 execution through vectorisation, cache locality and scheduling, and evaluated a multicore version.
>
> **Reported result.** The CV reports decoder-time ratios of 130% for the optimised pipeline and 600% for the SADL comparison, with 115% using multicore execution. Here, the ratio is decoder time with the model divided by base-decoder time, multiplied by 100; 100% is the base decoder.

That means 130% is 1.30 times baseline time, or 30% overhead; 600% is six times baseline, or 500% overhead. Do not call these “130% complexity reduction” or infer a controlled speedup until conditions match. A 2027 call-for-proposals reference is prospective, not acceptance. Omit “ready” until the acceptance criteria, evaluation configuration and disclosure clearance are documented. Required evidence: CPU, core count, model, precision, sequence set, codec version, timing scope and equivalence conditions.

### B. AI-based in-loop filters

Current complete bullets:

> Designed a low-complexity neural network for suppressing compression and banding artefacts.
> Combined handcrafted filters with NNLF, trained on DIV2K, scaled and blended with the deblocking output.
> Delivered state-of-the-art Bjøntegaard Delta Bitrate gains at ultra-low complexity — under 1k MAC/pixel.
> Integrated the model into the VVC Test Model, with C++ inference through optimised SADL.

Proposed:

> Developed a low-complexity neural in-loop filter to reduce compression and banding artefacts. The approach combined handcrafted filtering with a neural loop filter, trained on DIV2K, and scaled and blended its output with the deblocking output. I integrated the model into the VVC Test Model and enabled C++ inference through SADL. The CV reports a model compute budget below 1,000 multiply–accumulate operations per pixel.

Retain no “state-of-the-art” claim without a dated comparison table and evaluation protocol. Supply actual BD-rate values, sign convention, anchor, operating points, channels, test classes and encoding configuration. MACs per pixel quantify operations, not runtime or power. A convincing figure is a controlled crop comparison with identical source, bitrate and display conditions.

### C. AI-based intra-frame prediction

Current complete bullets:

> Examined whether a single neural model could replace seven post-VVC intra predictors across coding unit sizes.
> Designed an input preprocessing stage that retains strong inter-pixel correlation in reference regions.
> Developed a unified model of multi-scale CNN blocks adaptable to differing spatial resolutions.
> Integrated the NN-based mode alongside classical predictors in post-VVC, with SADL inference.

Proposed:

> Investigated a unified neural intra-prediction model across coding-unit sizes as an alternative to seven existing predictors. I developed reference-region preprocessing and a multi-scale convolutional architecture for different spatial resolutions, then integrated the neural mode alongside classical predictors with SADL inference.

Confirm that the seven predictors were neural models and identify the codec branch; the supplied wording does not fully establish this, the draft therefore retains the neutral phrase “seven existing predictors” until confirmed. Replacing model variants does not imply replacing all classical intra modes. Required evidence: input/output schematic, model-size comparison, compute and BD-rate results, and a precise mapping to the two application numbers.

### D. Open Advanced Professional Video codec (APV)

Current complete bullets:

> Contributed core algorithms to APV, an open-source, perceptually lossless professional codec.
> Optimised the DCT transform and quantisation using platform intrinsics — NEON and AVX.
> Brought APV plugins to FFmpeg, ultrasound edge devices and Premiere Pro for NAB demonstrations.
> Integrated the codec end to end on Samsung edge devices for a Samsung Developer Conference demo.

Proposed:

> Contributed to APV, an open-source professional video codec. My work included discrete cosine transform and quantisation optimisation using NEON and AVX intrinsics. I also worked on APV integration for FFmpeg, edge-device and editing-tool demonstrations, including NAB and Samsung Developer Conference demonstrations.

This keeps integration scope without implying sole ownership of adoption. “Perceptually lossless” may describe a codec operating point rather than every configuration; use it with an attributed technical description after verification. Supply public commit links, kernel before/after timings, supported architecture and your precise demo role. No measured acceleration is currently stated.

### E. IEEE DJI RoboMaster AI Challenge

Current complete bullets:

> Engineered two autonomous robots for intelligent shooting in a dynamic arena.
> Adapted YOLO-v5 for armour-plate detection at roughly 85% mAP and 90% shooting accuracy.
> Built motion planning and localisation from visual marker detection combined with rf2o laser odometry.
> Deployed YOLO-v5 on outpost camera feeds via DarkNet for global robot and opponent localisation.

Proposed:

> Contributed to a two-robot autonomous system for the IEEE ICRA DJI RoboMaster AI Challenge 2022. My work included armour-plate detection using a customised YOLOv5 model and motion planning and localisation using visual markers with rf2o laser odometry. The CV reports 85% mAP for detection and 90% shooting accuracy. Team ERA-IITK placed third globally among more than 40 teams.

Add the outpost-camera deployment after confirming the YOLOv5/DarkNet implementation path; those names require an accurate explanation rather than editorial correction by guesswork. Define mAP threshold and dataset, and shooting trial conditions. Keep the team finish explicitly attributed to the team. A short labelled arena video and a system diagram would explain more than another paragraph of adjectives.

### F. ISRO Chandrayaan moon mapping challenge

Current complete bullets:

> Trained a network to produce high-resolution lunar terrain from medium- and low-resolution inputs.
> Processed TMC and OHRC imagery into ortho-corrected rectangular patches for training.
> Cascaded SRGAN with a Shifted Window Transformer (SwinIR) to reach 16× upscaling.
> Reached an SSIM of 0.71 against the high-resolution OHRC reference imagery.

Proposed:

> Worked on lunar-image super-resolution for the Inter-IIT Chandrayaan Moon Mapping Challenge. I processed TMC and OHRC imagery into ortho-corrected training patches and trained a cascade combining SRGAN and SwinIR. The CV reports 16× upscaling and an SSIM of 0.71 against OHRC reference imagery.

Clarify whether 16× refers to each linear dimension or pixel count, how registration was handled, which held-out split was used and what baseline SSIM was. Describe this as image super-resolution, not verified recovery of true unseen terrain detail. Show input, interpolation baseline, model output and reference at comparable crops; label the output as reconstructed imagery.

## 7. Publications, applications and standards

Source: `/publications/`, `lib/content.ts`; CV p. 2.

**Current introduction:** “Peer-reviewed work, filed patents, and contributions to video coding standards.”

**Proposed:** “Research papers and patent applications in autonomous systems and neural video coding.” Add a separate standards section only when there are public submission numbers or other inspectable evidence. Working towards a standard is not adoption into a standard.

Keep both authentic publication titles exactly as supplied, even where their grammar is unusual:

1. “A cyber-physical system based unmanned ground vehicles for safety inspection and rescue support in an underground mine” — journal, 2025.
2. “Towards autonomous shooting rover via situation aware visual-perception and dynamic action execution” — SII, 2024.

Retain citations and author order. The proposed descriptions below are derived from the current website wording; the CV supplies citations, not abstracts. Compare both proposed descriptions with the actual papers before publication. Neither paper's full text was independently read or verified for this report. The current mine-paper description says, in part, “improving safety inspection, emergency rescue and assistance to miners in hazardous environments.” Replace that outcome implication with: “A cyber-physical robotic system for underground-mine inspection and rescue-support tasks, combining sensing and semi-autonomous navigation without GNSS.” Add “My contribution” only after identifying your role in that paper.

The current rover description claims “The novelty is a high-speed, accurate visual perception module … maximising the likelihood of a target being hit.” Proposed description: “A description of the ERA-IITK RoboMaster system, including hardware, visual target detection, localisation and state-machine control for autonomous operation.” Link to the paper for its actual novelty argument. Do not present a paraphrased abstract as independent evaluation.

**Current patent heading:** “Patents filed”. Prefer **“Patent applications”**. Preserve official titles and numbers; do not describe these as granted patents without registry evidence. The two CV applications are 202541023751 and 202541024348. Proposed summaries: “Reference-pixel preprocessing using an inverted L-scan for a unified neural intra predictor” and “A multi-scale neural architecture for coding-unit prediction from neighbouring reference lines.” These are plain-language summaries, not replacement legal titles.

The website-only 202541087044 currently describes a handcrafted filter as “the ‘secret sauce’”. Remove that phrase. Proposed provisional summary: “A content-adaptive in-loop-filter design that selects filtering configuration and pretrained weights while retaining a fixed hardware structure.” Publish only after confirming official title, inventor attribution, application status and what is publicly disclosable. Do not claim novelty or validity from an application number alone.

## 8. Education, recognition, teaching and skills

**Education current:** MS Computer Science, UCSD, Sep 2026–present; Electrical Engineering double major, IIT Kanpur, Jul 2023–Jun 2024, CPI 9.5/10; Mechanical Engineering BTech, Jul 2019–Jun 2023, CPI 9.0/10. Preserve these distinctions; do not turn the double major into a second degree. Expand CPI once as “Cumulative Performance Index”. No stylistic rewrite is needed beyond confirmed MS status.

**Recognition current:** “Third globally … among 40+ teams”; “Talent Transformer’s Award, 2025”; “Academic Excellence Award, twice … top 10%”. Proposed: “Team ERA-IITK: third place, IEEE ICRA DJI RoboMaster AI Challenge 2022, among more than 40 teams”; “Talent Transformer’s Award, Samsung Research, 2025, for teaching contributions”; “Academic Excellence Award, IIT Kanpur, 2020–21 and 2022–23; top 10% academic standing.” Confirm formal award names and attribution. These are credible without embellishment.

**Samsung teaching current:** “Interactive sessions on device-driver fundamentals through Linux kernel programming on a Raspberry Pi”; “Recognised with the Talent Transformer’s Award, 2025.” Proposed: “Delivered interactive device-driver sessions using Linux kernel programming on Raspberry Pi for Samsung Research's Learning and Development programme; recognised with the Talent Transformer’s Award in 2025.” Supply audience, hours and a permissible sample exercise; do not invent learner outcomes.

**IIT Mandi current:** “Designed an institute-wide compulsory interdisciplinary course on building a robot from scratch”; “Ran a 30-day workshop training the teaching assistants who would deliver it.” Proposed: “Designed the Foundations of Design Practicum course and conducted a 30-day robot-building workshop for its teaching assistants, following an invitation from Prof. Laxmidhar Behera.” Confirm whether you designed the entire course or a component, and whether its compulsory status applied to the whole institute or particular cohorts. The broad current claim needs that distinction.

**Source/CV skills inventory (not a visible current website section):** The `skills` array in `lib/content.ts` is not rendered by any current app/component. It contains C++, C, Python, Halide, Embedded C, On-device AI, PyTorch, TensorFlow, OpenCV, OpenAPV, SADL, DarkNet, NEON, AVX, FFmpeg, ROS, Gazebo. This is a reasonable subset of the CV; omission of Java, mobile programming or Agentic AI is not a discrepancy requiring restoration. Proposed groups: “Systems and optimisation: C++, C, Halide, NEON, AVX”; “Machine learning and vision: Python, PyTorch, TensorFlow, OpenCV”; “Robotics: ROS, Gazebo”; “Video coding: OpenAPV, SADL, FFmpeg”. Keep DarkNet if technically accurate. Link skills to projects rather than displaying proficiency scores.

## 9. Writing, contact and footer

**Blog current:** “Notes on compression, vision, and the occasional detour.” Empty state: “Nothing published yet. The first post is in progress.” Both Markdown files are explicitly draft fixtures, not portfolio publications. Do not review their fabricated test-table numbers as research evidence or publish them as your writing. Proposed empty state: “No posts published yet.” That avoids asserting an actual draft is in progress. Proposed introduction: “Technical notes on video coding, machine learning and robotic systems.” Retain the lighter original if it reflects your voice.

Possible future post prompts, not claims of existing content: explain one Halide scheduling trade-off; explain the NNLF timing metric; describe an imperfect-demonstration failure case. Public proprietary results require clearance before appearing in a public repository, even as drafts.

**Contact current:** “Write to me about anything: research, a collaboration, a correction, a question about a post.” Proposed: “Get in touch about research, engineering opportunities, collaboration or a question about my work.” Only name opportunities you actually welcome. Keep the direct email alternative. Do not promise response times. The CV lists a Gmail address and phone while the site uses `swatsa@ucsd.edu`; confirm preferred public contact and active delivery, without assuming the difference is an error.

**Footer current:** “Elsewhere”, GitHub/LinkedIn/Google Scholar/ORCID, “Motion studies”, “Get in touch”, “Write a message”. These need little copy editing. Consider moving “Motion studies” into a secondary experimental area if it competes with your work; decorative experimentation is not academic evidence. Preserve verified profile links, and do not imply ORCID or Scholar independently validates every site claim.

## 10. Media plan and next-draft checklist

| Location | Recommended evidence | Caption / purpose | What is needed |
|---|---|---|---|
| Home selected work | One actual output per featured project | Explain the task in one sentence | Source asset and contribution context |
| Halide | Pipeline diagram plus decoder-time chart | State 100% base decoder, precision and hardware | Comparable measurements and publishable configuration |
| Loop filter | Equal-scale artefact crops | Source / anchor / proposed result with bitrate | Original outputs, evaluation settings, permitted dataset usage |
| Intra prediction | Reference-region and model diagram | Show preprocessing and coding-unit input/output | Accurate public architecture description |
| APV | Kernel benchmark or demo still | Identify platform and your implementation | Public commits or approved demonstration capture |
| RoboMaster | 15–30 second user-played video | Label detection, localisation and robot action | Recording ownership, actual test conditions |
| Chandrayaan | Input / baseline / reconstruction / reference | Explain 16× and SSIM protocol | Aligned held-out imagery and source attribution |
| IISc | Physical-arm sequence and task diagram | Separate simulation from physical deployment | Task, outcome, permitted recording |

The current landscape, bird-compression and painting cards are explicitly labelled “Illustrative image”, which is honest. Keep that label until replaced. Never relabel them as experimental outputs. Campus photographs provide institution context, not evidence of research. Alt text should describe the informative content; a chart needs a text summary, and speech in video needs captions or a transcript. Use video posters and user-controlled playback. Avoid an autoplay media wall.

Before the next draft, answer these high-value questions: What role or research opportunity is the site primarily for? What is your current UCSD status and final Samsung date? What did you personally implement on each team project? Can you provide the Halide configuration and timing definition, loop-filter comparison table, RoboMaster metric protocols and Chandrayaan split/baseline? Which artifacts can be linked publicly? What is the third application's official record? What was your exact ERA leadership and IIT Mandi course-design scope?

Proceed immediately with evidence-bounded copy and genuine media you can supply; hold only the unresolved assertions. Editorially, this portfolio has strong raw material but is **not yet READY as a complete research narrative**. The next release should make three projects inspectable and reconcile the CV before adding more polish. After you approve the wording and supply missing facts, implementation and independent release QA remain separate steps; this report neither changes the site nor authorises deployment.
