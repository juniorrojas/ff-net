import torch

def f(x, w, b):
    return (x * w + b).sigmoid()

def run(x, w, b):
    x = torch.tensor(x, dtype=torch.float32)
    w = torch.tensor(w, dtype=torch.float32, requires_grad=True)
    b = torch.tensor(b, dtype=torch.float32, requires_grad=True)
    o = f(x, w, b)
    print(f"f(x) = {o}")
    o.backward()
    print(f"w.grad = {w.grad}")
    print(f"b.grad = {b.grad}")

run(0, 1, 0)