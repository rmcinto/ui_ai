from ultralytics import YOLO

def train_yolo(model_name="yolov8n.pt", data_yaml="data/processed/yolo/data.yaml", epochs=50):
    model = YOLO(model_name)
    model.train(data=data_yaml, epochs=epochs)

if __name__ == "__main__":
    train_yolo()