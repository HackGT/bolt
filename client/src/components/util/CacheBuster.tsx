// From

import React from "react";

const semverGreaterThan = (versionA: string, versionB: string): boolean => {
  const versionsA = versionA.split(/\./g);

  const versionsB = versionB.split(/\./g);
  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());

    const b = Number(versionsB.shift());
    // eslint-disable-next-line no-continue
    if (a === b) {
      continue;
    }
    // eslint-disable-next-line no-restricted-globals
    return a > b || isNaN(b);
  }
  return false;
};

interface StateProps {
  loading: boolean;
  isLatestVersion: boolean;
  refreshCacheAndReload: () => void;
}

export default class CacheBuster extends React.Component<{ children: any }, StateProps> {
  constructor(props: { children: any }) {
    super(props);
    this.state = {
      loading: true,
      isLatestVersion: false,
      refreshCacheAndReload: () => {
        if (caches) {
          // Service worker cache should be cleared with caches.delete()
          caches.keys().then(names => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
        // delete browser cache and hard reload
        window.location.reload(true);
      },
    };
  }

  componentDidMount() {
    fetch("/meta.json")
      .then(response => response.json())
      .then(meta => {
        const latestVersion = meta.version;
        // @ts-ignore
        const currentVersion = global.appVersion;

        const shouldForceRefresh = semverGreaterThan(latestVersion, currentVersion);
        if (shouldForceRefresh) {
          this.setState({ loading: false, isLatestVersion: false });
        } else {
          this.setState({ loading: false, isLatestVersion: true });
        }
      });
  }

  render() {
    const { loading, isLatestVersion, refreshCacheAndReload } = this.state;
    return this.props.children({ loading, isLatestVersion, refreshCacheAndReload });
  }
}
