import torch
import torch.nn as nn
torch.manual_seed(0)

model = nn.Sequential(
    nn.Linear(2, 3),
    nn.Sigmoid(),
    nn.Linear(3, 1),
    nn.Sigmoid()
)

print("w1")
print(model[0].weight)
print("b1")
print(model[0].bias)
print("w2")
print(model[2].weight)
print("b2")
print(model[2].bias)

y = model(torch.tensor([[0.2, 0.3]]))
print(y)
# y.backward()
# print("w1")
# print(model[0].weight.grad)
# print("b1")
# print(model[0].bias.grad)
# print("w2")
# print(model[2].weight.grad)
# print("b2")
# print(model[2].bias.grad)