'''
This code covers question:
-- Does the range of score used by voters depend of the candidate they support? --
'''
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from source.python.utils import load_data, load_meta_data

data = load_data()
meta = load_meta_data()

data_ev = data.filter(regex='EV_').copy()
ev_columns = list(data_ev.columns)
data_ev[data_ev == ' None'] = 0.0
data_ev[data_ev.columns] = data_ev[data_ev.columns].apply(pd.to_numeric)
data_ev['VOTE'] = data.VOTE
data_ev = data_ev[data_ev.VOTE != ' NSPP']

preferred = []
not_preferred = []
for index, row in data_ev.iterrows():
    preferred_column = 'EV_' + row.VOTE.strip()
    for ev_column in ev_columns:
        if ev_column == preferred_column:
            preferred.append(row[ev_column])
        else:
            not_preferred.append(row[ev_column])

bins = 30
preferred_hist = np.histogram(preferred, range=(-0.25, 1.25), bins=bins)[0]
not_preferred_hist = np.histogram(not_preferred, range=(-0.25, 1.25), bins=bins)[0]

# Data transformation: percentage
preferred_hist_per = preferred_hist * 100 / np.sum(preferred_hist)
not_preferred_hist_per = not_preferred_hist * 100 / np.sum(not_preferred_hist)
z = [preferred_hist_per,
     not_preferred_hist_per]

# Creating x labels
x_labels = int(bins / 12) * ['']
for x in range(10):
    x_labels.append(str(round(x / 10, 2)))
    x_labels += int(bins * 1 / 30 - 1) * ['']
x_labels.append(str(1.0))
x_labels += int(bins / 12 - 1) * ['']

ax = sns.heatmap(z,
                 cbar_kws={'label': 'Percentage of votes'},
                 cmap="YlGnBu")
ax.set_xlabel('Score (window size 0.05)')
ax.set_xticklabels(x_labels)
ax.set_yticklabels(['Supported\ncandidate', 'Other\ncandidates'], rotation=90)
# plt.show()
plt.savefig('../../results/GI_score_range.png')


# Pure histograms

fig = plt.figure()
sns.distplot(preferred, label='Preferred cand.')
sns.distplot(not_preferred, label='Other cands.')
plt.yticks([])
plt.legend()
#plt.show()
fig.savefig('../../results/GI_score_range_hist.png')

print('Done')
