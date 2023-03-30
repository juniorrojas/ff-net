from pathlib import Path
import os
this_filepath = Path(os.path.abspath(__file__))
this_dirpath = this_filepath.parent
import configparser
import sys

class TextColor:
    green = "\033[92m"
    yellow = "\033[93m"
    end = "\033[0m"

def color_text(color, text):
    return f"{color}{text}{TextColor.end}"

def yellow(text):
    return color_text(TextColor.yellow, text)

def green(text):
    return color_text(TextColor.green, text)

def infer_repo_dirname():
    current_dirpath = Path(os.path.abspath(os.getcwd()))
    while not os.path.exists(current_dirpath.joinpath(".git")):
        if current_dirpath.parent == current_dirpath:
            raise RuntimeError("could not infer repo name")
        current_dirpath = current_dirpath.parent
    return str(current_dirpath)

def infer_remote_url():
    config = configparser.ConfigParser()
    repo_dirname = infer_repo_dirname()
    config.read(os.path.join(repo_dirname, ".git", "config"))
    sections = config.sections()
    # TODO handle case when .git/config contains multiple remote sections
    for section in sections:
        is_remote = False
        try:
            section.index("remote")
            is_remote = True
        except:
            pass
        if is_remote:
            is_github_remote = False
            remote_url = config.get(section, "url")
            print(yellow(f"Inferred remote: {remote_url}"), file=sys.stderr)
            try:
                remote_url.index("github")
                is_github_remote = True
            except:
                pass
            if is_github_remote:
                return remote_url

    return None
