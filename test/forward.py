import torch
import torch.nn as nn
torch.manual_seed(0)

model = nn.Sequential(
    nn.Linear(2, 3),
    nn.Sigmoid(),
    nn.Linear(3, 2),
    nn.Sigmoid()
)

x = torch.tensor([0.2, 0.3])
y = model.forward(x)
print(y)