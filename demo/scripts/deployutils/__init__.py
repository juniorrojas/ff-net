from pathlib import Path
import os
this_filepath = Path(os.path.abspath(__file__))
this_dirpath = this_filepath.parent
import configparser

def infer_repo_dirname():
    current_dirpath = Path(os.path.abspath(os.getcwd()))
    while not os.path.exists(current_dirpath.joinpath(".git")):
        if current_dirpath.parent == current_dirpath:
            raise RuntimeError("could not infer repo name")
        current_dirpath = current_dirpath.parent
    return str(current_dirpath)