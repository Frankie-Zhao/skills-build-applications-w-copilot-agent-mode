import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  getData: (path: string) => Promise<T>;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  renderData: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, path, getData, emptyMessage, isEmpty, renderData }: Props<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setData(undefined);
    setError(undefined);
    void getData(path).then((result) => {
      if (active) setData(result);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unexpected error');
    });
    return () => { active = false; };
  }, [getData, path]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error !== undefined
          ? <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
          : data === undefined
            ? <p role="status">Loading {title.toLowerCase()}...</p>
            : isEmpty(data)
              ? <p>{emptyMessage}</p>
              : renderData(data)}
      </div>
    </section>
  );
}
