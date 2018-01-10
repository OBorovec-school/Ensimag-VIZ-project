import os

import numpy as np
import pandas as pd

DATA_FILES = ['VT1.csv', 'VT2.csv', 'VT3.csv']
META_DATA_FILE = 'metadata.csv'


def files(path):
    for file in os.listdir(path):
        file_path = os.path.join(path, file)
        if os.path.isfile(file_path):
            yield file_path, file


def load_data(data_folder='../../data'):
    dfs = []
    for file_path, file in files(data_folder):
        if file in DATA_FILES:
            df = pd.read_csv(file_path, sep=';', index_col=False)
            df['source_file'] = file
            dfs.append(df)
    data = pd.concat(dfs)
    data = data.rename(columns=lambda x: x.strip())
    return data


def load_meta_data(data_folder='../../data'):
    meta_data_file = os.path.join(data_folder, META_DATA_FILE)
    meta = pd.read_csv(meta_data_file, sep=';').transpose()
    meta.columns = meta.iloc[0]
    meta.reindex(meta.index.drop('abbr.'))
    # it reads NA as NaN > correstion needed
    meta = meta.rename(columns={np.nan: 'NA'})
    return meta


def norm(numbers):
    min_n = np.min(numbers)
    numbers = numbers - min_n
    max_n = np.max(numbers)
    numbers = numbers / max_n
    return numbers


def hex_color(str):
    return int(str, 16)
