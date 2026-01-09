---
layout: archive
title: "Projects"
permalink: /projects/
author_profile: true
---

## AI-Based In-loop Filters
Samsung Research Bangalore, India

- Aimed to design a low-complexity neural network (NN) model for suppressing compression and banding artefacts.
- Combined artefact-aware handcrafted filters with NN-based loop filters (NNLF), trained on DIV2K.
- Introduced a dedicated scaling and signaling framework enabling NNLF to operate alongside the deblocking filter.
- Delivered state-of-the-art Bjñtegaard Delta Bitrate (BD-BR) gains at ultra-low complexity (< 5k MAC/pix).
- Integrated the proposed model within the VVC Test Model (VTM), enabling C++ inference using optimized SADL.

## AI-Based Intra-Frame Prediction
Samsung Research Bangalore, India

- Aimed to construct a unified AI-driven intra-frame prediction method applicable across multiple coding unit sizes.
- Designed an intelligent input preprocessing stage to retain strong inter-pixel correlations in reference regions.
- Developed a unified neural model featuring multi-scale CNN blocks adaptable to differing spatial resolutions.
- Integrated the NN-based intra-prediction mode alongside classical predictors in post-VVC, enabling C++ inference.
- Delivered notable coding efficiency gains using a single model, replacing seven separate post-VVC model variants.

## Open Advanced Professional Video Codec (APV)
Samsung Research Bangalore, India

- Contributed core algorithms for APV, an open-source, professional-grade video codec which is perceptually lossless.
- Optimized the DCT2 transform and quantization steps using platform-specific intrinsic tools (NEON and AVX).
- Popularized APV plugins in FFMPEG, ultrasound edge devices and editing tools like Premiere Pro for NAB demos.
- Integrated APV codec end-to-end on Samsung edge devices for a Samsung Developer Conference (SDC) demo.

## IEEE DJI RoboMaster AI Challenge
Prof. Laxmidhar Behera

- Engineered two DJI autonomous robots for intelligent shooting in a dynamic arena with advanced AI behaviour.
- Customized the YOLO-v5 model for target armour plate detection with ~85% mAP and shooting accuracy of ~90%.
- Developed motion planning and localization modules via visual marker detection combined with laser odometry.
- Utilized DarkNet framework to deploy YOLO-v5 on camera feeds for global robot and enemy localization.
- Designed system integration and high-speed perception pipelines for real-time operation.

## ISRO Chandrayaan Moon Mapping Challenge
Inter-IIT Tech Meet

- Trained an AI network to produce high-resolution lunar terrain images from medium/low resolution inputs.
- Processed the training dataset (TMC and OHRC images) to obtain ortho-corrected rectangular patches.
- Trained and fine-tuned SRGAN cascaded with Shifted Window Transformer (SwinIR) to achieve 16x upscaling.
- Achieved SSIM score of 0.71, indicating high similarity between outputs and high-resolution OHRC images.
- Evaluated model performance and produced high-fidelity lunar reconstructions for mapping tasks.
