'''
This code covers question:
-- Which candidates are approved together? --
'''
import math
import itertools
from collections import defaultdict

import pandas as pd
import numpy as np
from sklearn import manifold
import matplotlib.pyplot as plt

from source.utils import load_data, load_meta_data, hex_color

data = load_data()
meta = load_meta_data()

data_av = data.filter(regex='AV_').copy()
av_columns = list(data_av.columns)
candidates = [x.split('_')[1] for x in av_columns]

comb = defaultdict(int)
for index, row in data_av.iterrows():
    approved = tuple(row[row == 1].index)
    comb[approved] += 1
sorted_comb = [(k, comb[k]) for k in sorted(comb, key=comb.get, reverse=True)]

count_df = pd.DataFrame(0, columns=av_columns, index=av_columns)
for index, row in data_av.iterrows():
    for c in itertools.combinations(list(row[row == 1].index), 2):
        count_df[c[0]][c[1]] += 1
        count_df[c[1]][c[0]] += 1
max_v = count_df.max().max()
dist_df = count_df.applymap(lambda x: x / max_v)\
                  .applymap(lambda x: 2 *np.log(-x + 1.1) + 5 if x != 0 else np.nan)
dist_matrix = dist_df.fillna(10 * dist_df.max().max()).as_matrix()
space = pd.DataFrame(manifold.TSNE(2, 4, metric='precomputed').fit_transform(dist_matrix),
                     #manifold.MDS(2, 2, metric='precomputed').fit_transform(dist_matrix),
                     columns=['x', 'y'],
                     index=[meta[x]['name'] for x in candidates])
space['short'] = candidates
space['color'] = [hex_color(meta[x]['color']) for x in candidates]

fig = plt.figure()
ax = plt.gca()
ax.scatter(space.x,
           space.y,
           c=space.color,
           s=100,
           alpha=0.5)


for index, row in space.iterrows():
    ax.annotate(index.replace(' ', '\n', 1),
                xy=(row.x, row.y),
                xytext=(row.x, row.y))
plt.axis('off')
# plt.show()

plt.savefig('../results/GI_approved_together.png')


