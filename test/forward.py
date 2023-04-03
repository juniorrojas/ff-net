import torch
import torch.nn as nn
torch.manual_seed(0)

model = nn.Sequential(
    nn.Linear(2, 3),
    nn.Sigmoid(),
    nn.Linear(3, 2),
    nn.Sigmoid()
)

print("l1w")
print(model[0].weight)
print("l1b")
print(model[0].bias)
print("l2w")
print(model[2].weight)
print("l2b")
print(model[2].bias)

x = torch.tensor([0.2, 0.3])
y = model.forward(x)
print("output")
print(y)