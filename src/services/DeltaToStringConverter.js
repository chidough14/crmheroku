const DeltaToStringConverter = (delta) => {
  const formatInsert = (insert) => {
    if (typeof insert === "string") {
      return insert;
    } else if (insert.mention) {
      return insert.mention.value;
    }
  };

  const formatAttributes = (attributes) => {
    if (attributes && attributes.bold) {
      return "strong";
    }

    if (attributes && attributes.link) {
      return `a href=${attributes.link}`;
    }

    if (attributes && attributes.list) {
      return `li`;
    }

    if (attributes && attributes.strike) {
      return `del`;
    }

    if (attributes && attributes.underline) {
      return `u`;
    }

    if (attributes && attributes.italic) {
      return `em`;
    }
    return "";
  };

  const formattedText = delta
    .map((segment) => {
      if (segment.insert) {
        const text = formatInsert(segment.insert);
        const attributes = formatAttributes(segment.attributes);
        if (attributes) {
          if (attributes.startsWith('a')) {
            return `<${attributes}>${text}</${attributes.charAt(0)}>`;
          } else {
            return `<${attributes}>${text}</${attributes}>`;
          }
         
        }
        return text;
      }
      return "";
    })
    .join(" ");

  return `<p>${formattedText}</p>`
}

export { DeltaToStringConverter }