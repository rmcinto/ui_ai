# UI Component Identification Pipeline

## Introduction
This project is designed to identify user interface (UI) components in videos of individuals interacting with various applications. Possible scenarios include:
- Desktop software
- Command-line interfaces (CLI)
- Web applications
- Operating system UI elements

The pipeline performs:
1. Video ingestion and frame extraction.
2. Preprocessing (e.g., resizing, normalization).
3. Annotation of UI components (bounding boxes, color, text, etc.).
4. Dataset creation for model training and validation.
5. Model training and evaluation to detect and classify UI elements.

---

## Folder Structure

A typical layout for this project is:

    .
    ├── docs/
    │   ├── requirements/         # Design requirements, user stories
    │   └── architecture/         # Architecture diagrams, technical documents
    ├── scripts/
    │   ├── extract_frames.py     # Extracts frames from raw videos
    │   ├── build_dataset.py      # Combines frames + annotations, creates final datasets
    │   ├── train_model.py        # Trains the ML model
    │   ├── evaluate_model.py     # Evaluates model performance
    │   ├── inference.py          # Runs inference/demos on new data
    │   └── pipeline_utils.py     # Shared utility functions used across scripts
    ├── data/
    │   ├── raw/                  # Unaltered video files
    │   ├── processed/            # Frames or files after preprocessing
    │   ├── annotations/          # Annotations (e.g., bounding boxes in JSON)
    │   ├── datasets/             # Final dataset splits (train, val, test)
    │   ├── references/           # (Optional) reference images, label maps, color definitions
    │   └── sample/               # Small sample dataset for quick tests or demos
    ├── requirements.txt          # Dependencies for this pipeline
    ├── setup_pipeline.py         # Script that creates folder structure, venv, installs deps
    └── __env/                    # Virtual environment folder (auto-created by setup_pipeline)

### Key Folders
1. **docs/**  
   - Contains high-level project documentation, requirements, and architectural diagrams.

2. **scripts/**  
   - **extract_frames.py**: Reads raw video files from `data/raw/` and extracts individual frames.
   - **build_dataset.py**: Aggregates frames and annotations into final train/val/test splits in `data/datasets/`.
   - **train_model.py**: Trains a machine learning model (PyTorch, TensorFlow, etc.) using data in `data/datasets/`.
   - **evaluate_model.py**: Evaluates the trained model on `data/datasets/test/` and produces metrics (e.g., mAP, accuracy).
   - **inference.py**: Runs inference on new videos or images, demonstrating the model’s ability to detect UI components.
   - **pipeline_utils.py**: Utility module for shared functions (e.g., data augmentation, logging, file I/O).

3. **data/**  
   - **raw/**: Original video files in their unaltered form.
   - **processed/**: Processed or intermediate data (extracted frames, resized images, etc.).
   - **annotations/**: Stores annotation files describing bounding boxes, transitions, or other attributes.
   - **datasets/**: Houses final datasets for training, validation, and testing.
   - **references/**: (Optional) images, color dictionaries, or label maps for reference.
   - **sample/**: A small subset of data for quick tests or debugging.

4. **requirements.txt**  
   - Lists Python packages needed for this pipeline (e.g., opencv-python, torch, torchvision).
   - Installed automatically by `setup_pipeline.py` or manually via `pip install -r requirements.txt`.

5. **setup_pipeline.py**  
   - Creates the folder structure, generates (or updates) `requirements.txt`, makes a virtual environment (`__env`), and installs dependencies.

6. **__env/**  
   - The Python virtual environment created by `setup_pipeline.py`.
   - Activate using:
     - **Windows Command Prompt**:  
       `.\__env\Scripts\activate`
     - **Git Bash / Unix-like**:  
       `source __env/Scripts\activate`

---

## Naming Conventions

1. **Raw Video Files**  
   - Placed in `data/raw/`.
   - Use a clear naming scheme, for example:
     ```
     session_01_desktop_app.mp4
     session_02_cli.mov
     session_03_web_browser.mp4
     ```
   - Alternatively, incorporate timestamps or subject IDs:
     ```
     user1_2024_02_10.mp4
     user2_2024_02_11.mov
     ```

2. **Extracted Frames**  
   - Stored in subfolders under `data/processed/`.
   - Use zero-padded indices for frames:
     ```
     data/processed/session_01_desktop_app/frame_00001.jpg
     data/processed/session_01_desktop_app/frame_00002.jpg
     ```

3. **Annotations**  
   - Named similarly to the source video/session (e.g., session_01_desktop_app.json).
   - Keep bounding box data, text attributes, colors, or transitions relevant to each frame.

4. **Datasets**  
   - Final data splits (train/val/test) in `data/datasets/`.
   - Each subfolder typically contains images and corresponding annotation references.

---

## Pipeline Steps in Detail

### 1. Environment Setup

1. **Install Python 3.11** (or your preferred version).
2. **Run**:
   
       python setup_pipeline.py
   
   This automatically:
   - Creates folders as shown in [Folder Structure](#folder-structure).
   - Creates (or updates) `requirements.txt`.
   - Sets up a `__env` virtual environment.
   - Installs dependencies from `requirements.txt`.

3. **Activate** the environment:
   - **Windows Command Prompt**:
     
         .\__env\Scripts\activate
     
   - **Git Bash / Unix-like**:
     
         source __env/Scripts/activate

---

### 2. Video Ingestion & Frame Extraction

1. **Place your videos** in `data/raw/`.
2. **Run** `extract_frames.py`:
   
       python scripts/extract_frames.py
   
   - Reads each `.mp4` or `.mov` in `data/raw/`, extracts frames, and stores them in `data/processed/<video_name>`.
   - Configure frame rate, resize dimensions, etc., within the script.

---

### 3. Annotation

1. **Use** a labeling tool (e.g., CVAT, LabelImg) or an automated approach to create annotations.
2. **Store** annotation files in `data/annotations/` with consistent naming.

---

### 4. Build Dataset

1. **Run** `build_dataset.py`:
   
       python scripts/build_dataset.py
   
   - Combines frames from `data/processed/` with annotation files in `data/annotations/`.
   - Splits data into train, val, and test sets in `data/datasets/`.
   - Converts annotations to the required format (COCO, YOLO, or a custom layout).

---

### 5. Model Training

1. **Run** `train_model.py`:
   
       python scripts/train_model.py
   
   - Loads your training dataset from `data/datasets/train/`.
   - Trains the model (PyTorch, TensorFlow, etc.) while logging metrics like accuracy or mAP.
   - Saves model checkpoints for future reuse or fine-tuning.

---

### 6. Evaluation

1. **Run** `evaluate_model.py`:
   
       python scripts/evaluate_model.py
   
   - Applies the trained model to `data/datasets/test/`.
   - Generates evaluation metrics (e.g., confusion matrix, precision/recall, mAP).
2. **Identify** any shortcomings (false positives, missed detections) and refine data or model parameters.

---

### 7. Inference

- **Run** `inference.py`:
  
      python scripts/inference.py
  
  - Demonstrates how the trained model detects UI components in new images or videos.
  - Useful for demos, validating pipeline results, or real-world deployment tests.

---

## Usage & Workflow Summary

1. **Clone** or initialize the repo on your machine.
2. **Run** `python setup_pipeline.py` to create folder structure, venv, and install dependencies.
3. **Activate** the virtual environment (`__env`).
4. **Copy raw videos** into `data/raw/`.
5. **Extract frames** with `scripts/extract_frames.py`.
6. **Annotate** frames in `data/annotations/`.
7. **Build** final datasets with `scripts/build_dataset.py`.
8. **Train** your model using `scripts/train_model.py`.
9. **Evaluate** the model using `scripts/evaluate_model.py`.
10. **Test** or demo on new data via `scripts/inference.py`.
11. **Iterate** by refining annotations, adjusting hyperparameters, or collecting more data.

---

## Contributing

- **Pull Requests**: If you have ideas for new scripts (e.g., advanced data augmentation), please open a PR.
- **Issues**: Report bugs or request features using the project’s issue tracker.

---

## Future Enhancements

- **Automated Annotation**: Use a pretrained model to assist with labeling.
- **UI Transition Analysis**: Extend annotations to capture rollover states or animations.
- **Data Augmentation**: Implement systematic transformations (e.g., random crops, flips, color jitter) in `pipeline_utils.py`.

---

**Happy Building!**
