export function renderWithLinks(text, style) {
    const urlRegex = /<?(https?:\/\/[^\s<>\"]+)>?/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }
        const url = match[1];
        parts.push(
            <a
                key={url + match.index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={style}
            >
                {url}
            </a>
        );
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }
    return parts;
}
