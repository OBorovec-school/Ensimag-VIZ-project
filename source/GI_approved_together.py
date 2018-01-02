'''
This code covers question:
-- Which candidates are approved together? --
'''
import pandas as pd
from sklearn import manifold
import matplotlib.pyplot as plt

from source.utils import load_data, load_meta_data, hex_color

data = load_data()
meta = load_meta_data()

data_av = data.filter(regex='AV_').copy()
av_columns = list(data_av.columns)
av_dict = {}
for idx, avc in enumerate(av_columns):
    av_dict[avc] = idx

candidates = [x.split('_')[1] for x in av_columns]
cand_features = pd.DataFrame(index=av_columns)
for index, row in data_av.iterrows():
    approved = list(row[row == 1].index)
    selection = ','.join(approved)
    if selection not in cand_features.columns:
        cand_features[selection] = 0
    cand_features[selection] += row

space = pd.DataFrame(manifold.Isomap(2, 2).fit_transform(cand_features),
                     columns=['x', 'y'],
                     index=[meta[x]['name'] for x in candidates])
space['short'] = candidates
space['color'] = [hex_color(meta[x]['color']) for x in candidates]

fig = plt.figure()
ax = fig.add_subplot(111)
ax.scatter(space.x,
           space.y,
           c=space.color,
           s=200,
           alpha=0.5)
plt.axis('off')

    
plt.show()