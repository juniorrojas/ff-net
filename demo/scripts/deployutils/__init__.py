from pathlib import Path
import os
this_filepath = Path(os.path.abspath(__file__))
this_dirpath = this_filepath.parent
import configparser
import sys
import shutil
import subprocess

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

def cleandir(d):
    if os.path.exists(d):
        shutil.rmtree(d)
    os.makedirs(d)

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

def git_clone(repo, remote, deploy_path, deploy_branch):
    cleandir(deploy_path)
    print(yellow(f"Cloning git repo {repo}"), file=sys.stderr)

    os.chdir(deploy_path)
    e = subprocess.call(["git", "init"])
    if e != 0:
        raise RuntimeError("git init failed")
    e = subprocess.call(["git", "remote", "add", remote, repo])
    if e != 0:
        raise RuntimeError("git remote add failed")
    e = subprocess.call(["git", "pull", remote, deploy_branch])
    if e != 0:
        # we assume git pull failed because the branch doesn't exist,
        # this is the case the first time you try to deploy
        e = subprocess.call(["git", "checkout", "-b", deploy_branch])
        if e != 0:
            raise RuntimeError("git checkout failed")
    else:
        e = subprocess.call(["git", "checkout", deploy_branch])
        if e != 0:
            raise RuntimeError("git checkout failed")