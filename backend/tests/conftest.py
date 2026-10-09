import sys
import importlib.util
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# Add rift-service app dir to sys.path
rift_app_path = backend_path.parent / "rift-service" / "app"
if str(rift_app_path) not in sys.path:
    sys.path.insert(0, str(rift_app_path))

# Load rift-service main directly
rift_main_file = rift_app_path / "main.py"
if rift_main_file.exists():
    spec = importlib.util.spec_from_file_location("rift_service_main", str(rift_main_file))
    rift_service_module = importlib.util.module_from_spec(spec)
    sys.modules["rift_service_main"] = rift_service_module
    spec.loader.exec_module(rift_service_module)
