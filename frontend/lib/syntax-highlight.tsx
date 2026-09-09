import type { ReactNode } from "react"

const KEYWORDS_BY_LANGUAGE: Record<string, string[]> = {
  javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "default", "async", "await", "new", "this", "typeof", "true", "false", "null", "undefined"],
  typescript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "default", "async", "await", "new", "this", "typeof", "interface", "type", "extends", "implements", "true", "false", "null", "undefined"],
  python: ["def", "return", "if", "elif", "else", "for", "while", "class", "import", "from", "as", "with", "try", "except", "finally", "lambda", "None", "True", "False", "self"],
  java: ["public", "private", "protected", "static", "final", "class", "interface", "extends", "implements", "return", "if", "else", "for", "while", "new", "void", "true", "false", "null"],
  csharp: ["public", "private", "protected", "static", "readonly", "class", "interface", "namespace", "using", "return", "if", "else", "for", "while", "new", "void", "true", "false", "null"],
  cpp: ["int", "float", "double", "char", "void", "return", "if", "else", "for", "while", "class", "struct", "public", "private", "namespace", "include", "true", "false", "nullptr"],
  c: ["int", "float", "double", "char", "void", "return", "if", "else", "for", "while", "struct", "include", "typedef"],
  go: ["func", "return", "if", "else", "for", "range", "package", "import", "var", "const", "struct", "interface", "true", "false", "nil"],
  rust: ["fn", "let", "mut", "return", "if", "else", "for", "while", "loop", "struct", "enum", "impl", "trait", "use", "pub", "true", "false", "None", "Some"],
  ruby: ["def", "end", "return", "if", "elsif", "else", "unless", "for", "while", "class", "module", "require", "true", "false", "nil"],
  php: ["function", "return", "if", "else", "elseif", "foreach", "for", "while", "class", "public", "private", "protected", "namespace", "use", "true", "false", "null"],
  swift: ["func", "let", "var", "return", "if", "else", "for", "while", "class", "struct", "import", "true", "false", "nil"],
  kotlin: ["fun", "val", "var", "return", "if", "else", "for", "while", "class", "import", "true", "false", "null"],
  bash: ["if", "then", "else", "fi", "for", "do", "done", "while", "function", "echo", "export"],
  powershell: ["function", "if", "else", "foreach", "while", "return", "param", "true", "false", "null"],
  sql: ["select", "from", "where", "insert", "into", "values", "update", "set", "delete", "join", "on", "group", "order", "by", "create", "table"],
}

const STRING_RE = /(['"`])(?:\\.|(?!\1).)*\1/g
const COMMENT_RE = /(\/\/[^\n]*|#[^\n]*|--[^\n]*)/g
const NUMBER_RE = /\b\d+(\.\d+)?\b/g

interface Token {
  text: string
  type: "keyword" | "string" | "comment" | "number" | "plain"
}

function tokenize(code: string, language: string): Token[] {
  const keywords = new Set(KEYWORDS_BY_LANGUAGE[language] ?? [])
  const tokens: Token[] = []

  // First split out strings and comments, since they take priority over keywords/numbers.
  const spans: { start: number; end: number; type: "string" | "comment" }[] = []
  for (const m of code.matchAll(STRING_RE)) spans.push({ start: m.index!, end: m.index! + m[0].length, type: "string" })
  for (const m of code.matchAll(COMMENT_RE)) spans.push({ start: m.index!, end: m.index! + m[0].length, type: "comment" })
  spans.sort((a, b) => a.start - b.start)

  let cursor = 0
  const pushPlainOrKeyword = (segment: string) => {
    if (!segment) return
    const wordRe = /\w+|\W+/g
    for (const m of segment.matchAll(wordRe)) {
      const piece = m[0]
      if (keywords.has(piece)) {
        tokens.push({ text: piece, type: "keyword" })
      } else if (NUMBER_RE.test(piece)) {
        tokens.push({ text: piece, type: "number" })
        NUMBER_RE.lastIndex = 0
      } else {
        tokens.push({ text: piece, type: "plain" })
      }
    }
  }

  for (const span of spans) {
    if (span.start < cursor) continue // overlapping match, skip
    pushPlainOrKeyword(code.slice(cursor, span.start))
    tokens.push({ text: code.slice(span.start, span.end), type: span.type })
    cursor = span.end
  }
  pushPlainOrKeyword(code.slice(cursor))

  return tokens
}

const CLASS_BY_TYPE: Record<Token["type"], string> = {
  keyword: "text-blue-500 dark:text-blue-400 font-medium",
  string: "text-green-600 dark:text-green-400",
  comment: "text-muted-foreground italic",
  number: "text-orange-500 dark:text-orange-400",
  plain: "",
}

/** Renders code with lightweight, dependency-free syntax highlighting for the given language. */
export function highlightCode(code: string, language: string): ReactNode {
  const tokens = tokenize(code, language.toLowerCase())
  return tokens.map((token, i) => {
    const className = CLASS_BY_TYPE[token.type]
    return className ? (
      <span key={i} className={className}>
        {token.text}
      </span>
    ) : (
      <span key={i}>{token.text}</span>
    )
  })
}
