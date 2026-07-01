import type { ReactNode } from "react";

export type PageHeadProps = {
  crumb: ReactNode[];
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
};

export function PageHead({ crumb, title, sub, actions }: PageHeadProps) {
  return (
    <div className="page-head fade-in fade-in--1">
      <div className="page-head__left">
        <nav className="page-head__crumb" aria-label="Breadcrumb">
          {crumb.map((item, index) => (
            <span key={index} className="inline-flex items-center gap-1.5">
              {index > 0 && <span className="sep">/</span>}
              {item}
            </span>
          ))}
        </nav>
        <h1 className="page-head__title">{title}</h1>
        {sub && <p className="page-head__sub">{sub}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </div>
  );
}
