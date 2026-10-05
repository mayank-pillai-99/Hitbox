// "Nothing here yet" panel, with an optional call to action.
export default function EmptyState({ icon: Icon, title, children, action }) {
    return (
        <div className="panel border-dashed p-8 sm:p-12 text-center">
            {Icon && <Icon className="w-10 h-10 mx-auto mb-4 text-dim" aria-hidden="true" />}
            <p className="display text-xl text-fg">{title}</p>
            {children && <p className="mt-2 text-muted max-w-md mx-auto">{children}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
