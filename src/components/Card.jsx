export default function Card({ title, subtitle, children }) {
    return (
        <div className="card">
            {(title || subtitle) && (
                <div className="card-head">
                    {title && <div className="card-title">{title}</div>}
                    {subtitle && <div className="card-sub">{subtitle}</div>}
                </div>
            )}
            <div className="card-body">{children}</div>
        </div>
    );
}
