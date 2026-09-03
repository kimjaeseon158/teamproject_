import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiItalic,
  FiLink,
  FiList,
  FiMinus,
} from "react-icons/fi";

export const NOTICE_CONTENT_LIMIT = 5000;

const COLORS = [
  { label: "기본", value: "" },
  { label: "빨강", value: "#E53E3E" },
  { label: "주황", value: "#DD6B20" },
  { label: "초록", value: "#2F855A" },
  { label: "파랑", value: "#2B6CB0" },
  { label: "보라", value: "#6B46C1" },
];

export default function NoticeRichTextEditor({
  content = "",
  disabled = false,
  isInvalid = false,
  onChange,
}) {
  const linkModal = useDisclosure();
  const [linkUrl, setLinkUrl] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "공지 내용을 입력하세요. 핵심 내용을 먼저 작성하면 구성원이 빠르게 파악할 수 있습니다.",
      }),
      CharacterCount.configure({ limit: NOTICE_CONTENT_LIMIT }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      const text = currentEditor.getText();
      onChange?.({
        html: currentEditor.getHTML(),
        text,
        textLength: currentEditor.storage.characterCount.characters(),
        isEmpty: !text.trim(),
      });
    },
  });
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return EMPTY_TOOLBAR_STATE;
      return {
        block: getBlockValue(currentEditor),
        bold: currentEditor.isActive("bold"),
        italic: currentEditor.isActive("italic"),
        underline: currentEditor.isActive("underline"),
        strike: currentEditor.isActive("strike"),
        bulletList: currentEditor.isActive("bulletList"),
        orderedList: currentEditor.isActive("orderedList"),
        blockquote: currentEditor.isActive("blockquote"),
        alignLeft: currentEditor.isActive({ textAlign: "left" }),
        alignCenter: currentEditor.isActive({ textAlign: "center" }),
        alignRight: currentEditor.isActive({ textAlign: "right" }),
        link: currentEditor.isActive("link"),
        color: currentEditor.getAttributes("textStyle").color || "",
        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
      };
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || content === editor.getHTML()) return;
    editor.commands.setContent(content || "", { emitUpdate: false });
  }, [content, editor]);

  if (!editor || editor.isDestroyed) return null;

  const openLinkModal = () => {
    setLinkUrl(editor.getAttributes("link").href || "https://");
    linkModal.onOpen();
  };
  const saveLink = () => {
    const value = linkUrl.trim();
    if (!value) editor.chain().focus().unsetLink().run();
    else if (/^(https?:\/\/|mailto:)/i.test(value)) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: value, target: "_blank" }).run();
    } else return;
    linkModal.onClose();
  };

  return <>
    <Box borderWidth="1px" borderColor={isInvalid ? "red.500" : "gray.200"} borderRadius="md" bg="gray.50" overflow="hidden" _focusWithin={{ bg: "white", borderColor: isInvalid ? "red.500" : "blue.400", boxShadow: `0 0 0 1px var(--chakra-colors-${isInvalid ? "red" : "blue"}-400)` }}>
      <Flex px={2} py={2} gap={1} align="center" borderBottomWidth="1px" bg="white" overflowX="auto" flexWrap={{ base: "nowrap", xl: "wrap" }}>
        <Select aria-label="문단 스타일" size="sm" w="112px" flexShrink={0} value={toolbarState.block} onChange={(event) => setBlock(editor, event.target.value)} isDisabled={disabled} borderColor={toolbarState.block !== "paragraph" ? "blue.400" : "gray.200"} bg={toolbarState.block !== "paragraph" ? "blue.50" : "white"} fontWeight={toolbarState.block !== "paragraph" ? "700" : "normal"}>
          <option value="paragraph">본문</option><option value="1">제목 1</option><option value="2">제목 2</option><option value="3">제목 3</option>
        </Select>
        <ToolbarButton label="굵게" icon={FiBold} active={toolbarState.bold} onClick={() => editor.chain().focus().toggleBold().run()} disabled={disabled} />
        <ToolbarButton label="기울임" icon={FiItalic} active={toolbarState.italic} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={disabled} />
        <ToolbarButton label="밑줄" text="U" active={toolbarState.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={disabled} />
        <ToolbarButton label="취소선" icon={FiMinus} active={toolbarState.strike} onClick={() => editor.chain().focus().toggleStrike().run()} disabled={disabled} />
        <Menu><Tooltip label="글자색"><MenuButton as={Button} type="button" size="sm" variant={toolbarState.color ? "solid" : "ghost"} colorScheme={toolbarState.color ? "blue" : "gray"} minW="36px" px={2} isDisabled={disabled} aria-pressed={Boolean(toolbarState.color)}><Text as="span" borderBottomWidth="3px" borderColor={toolbarState.color || "gray.700"}>A</Text></MenuButton></Tooltip>
          <MenuList minW="130px">{COLORS.map((color) => <MenuItem key={color.label} onClick={() => color.value ? editor.chain().focus().setColor(color.value).run() : editor.chain().focus().unsetColor().run()}>
            <Box w="12px" h="12px" mr={2} borderRadius="full" bg={color.value || "gray.800"} />{color.label}
          </MenuItem>)}</MenuList></Menu>
        <ToolbarButton label="글머리표" icon={FiList} active={toolbarState.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled} />
        <ToolbarButton label="번호 목록" text="1." active={toolbarState.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled} />
        <ToolbarButton label="인용" text="❝" active={toolbarState.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} disabled={disabled} />
        <ToolbarButton label="왼쪽 정렬" icon={FiAlignLeft} active={toolbarState.alignLeft} onClick={() => editor.chain().focus().setTextAlign("left").run()} disabled={disabled} />
        <ToolbarButton label="가운데 정렬" icon={FiAlignCenter} active={toolbarState.alignCenter} onClick={() => editor.chain().focus().setTextAlign("center").run()} disabled={disabled} />
        <ToolbarButton label="오른쪽 정렬" icon={FiAlignRight} active={toolbarState.alignRight} onClick={() => editor.chain().focus().setTextAlign("right").run()} disabled={disabled} />
        <ToolbarButton label="링크" icon={FiLink} active={toolbarState.link} onClick={openLinkModal} disabled={disabled} />
        <ToolbarButton label="실행 취소" icon={FiCornerUpLeft} onClick={() => editor.chain().focus().undo().run()} disabled={disabled || !toolbarState.canUndo} />
        <ToolbarButton label="다시 실행" icon={FiCornerUpRight} onClick={() => editor.chain().focus().redo().run()} disabled={disabled || !toolbarState.canRedo} />
      </Flex>
      <Box sx={editorStyles}><EditorContent editor={editor} /></Box>
      <HStack px={4} py={2} justify="flex-end" borderTopWidth="1px" bg="white">
        <Text fontSize="xs" color={editor.storage.characterCount.characters() >= 4500 ? "orange.500" : "gray.400"}>{editor.storage.characterCount.characters()} / {NOTICE_CONTENT_LIMIT.toLocaleString()}</Text>
      </HStack>
    </Box>

    <Modal isOpen={linkModal.isOpen} onClose={linkModal.onClose} isCentered>
      <ModalOverlay /><ModalContent><ModalHeader>링크 설정</ModalHeader><ModalCloseButton />
        <ModalBody><FormControl><FormLabel>URL</FormLabel><Input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" /></FormControl>
          {linkUrl && !/^(https?:\/\/|mailto:)/i.test(linkUrl) && <Text mt={2} fontSize="sm" color="red.500">http, https 또는 mailto 주소만 사용할 수 있습니다.</Text>}
        </ModalBody>
        <ModalFooter gap={2}><Button variant="ghost" onClick={() => { editor.chain().focus().unsetLink().run(); linkModal.onClose(); }}>링크 제거</Button><Button colorScheme="blue" onClick={saveLink}>적용</Button></ModalFooter>
      </ModalContent>
    </Modal>
  </>;
}

function ToolbarButton({ label, icon, text, active = false, onClick, disabled }) {
  return <Tooltip label={`${label}${active ? " 선택됨" : ""}`}><IconButton type="button" size="sm" flexShrink={0} aria-label={label} aria-pressed={active} icon={icon ? <Box as={icon} /> : <Text fontWeight="800">{text}</Text>} variant={active ? "solid" : "ghost"} colorScheme={active ? "blue" : "gray"} boxShadow={active ? "inset 0 0 0 2px rgba(255,255,255,0.35)" : "none"} onClick={onClick} isDisabled={disabled} /></Tooltip>;
}

const EMPTY_TOOLBAR_STATE = {
  block: "paragraph", bold: false, italic: false, underline: false, strike: false,
  bulletList: false, orderedList: false, blockquote: false, alignLeft: false,
  alignCenter: false, alignRight: false, link: false, color: "", canUndo: false, canRedo: false,
};

function getBlockValue(editor) {
  if (editor.isActive("heading", { level: 1 })) return "1";
  if (editor.isActive("heading", { level: 2 })) return "2";
  if (editor.isActive("heading", { level: 3 })) return "3";
  return "paragraph";
}

function setBlock(editor, value) {
  if (value === "paragraph") editor.chain().focus().setParagraph().run();
  else editor.chain().focus().setHeading({ level: Number(value) }).run();
}

export const noticeContentStyles = {
  "& p.is-editor-empty:first-of-type::before": { color: "gray.400", content: "attr(data-placeholder)", float: "left", height: 0, pointerEvents: "none" },
  "& h1": { fontSize: "2xl", fontWeight: "800", mt: 6, mb: 3 },
  "& h2": { fontSize: "xl", fontWeight: "800", mt: 5, mb: 2 },
  "& h3": { fontSize: "lg", fontWeight: "700", mt: 4, mb: 2 },
  "& ul, & ol": { pl: 7, my: 3 },
  "& ul": { listStyleType: "disc" },
  "& ol": { listStyleType: "decimal" },
  "& blockquote": { borderLeftWidth: "4px", borderColor: "blue.300", bg: "blue.50", px: 4, py: 2, my: 4, color: "gray.700" },
  "& a": { color: "blue.600", textDecoration: "underline", cursor: "pointer" },
};

export const editorStyles = {
  ".tiptap": { minH: { base: "300px", md: "390px" }, p: 5, outline: "none", lineHeight: "1.8", color: "gray.800" },
  ...noticeContentStyles,
};
