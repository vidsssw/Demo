import React from "react";
import { EditorState, RichUtils, AtomicBlockUtils } from "draft-js";
import Editor, { composeDecorators } from "draft-js-plugins-editor";
import { mediaBlockRenderer } from "./mediaBlockRenderer";
import "./App.css";

import createImagePlugin from "draft-js-image-plugin";
import createResizeablePlugin from "draft-js-resizeable-plugin";

import createAlignmentPlugin from "draft-js-alignment-plugin";
import createFocusPlugin from "draft-js-focus-plugin";

import "draft-js-focus-plugin/lib/plugin.css";
import "draft-js-image-plugin/lib/plugin.css";
import "draft-js-alignment-plugin/lib/plugin.css";
const resizeablePlugin = createResizeablePlugin();
const alignmentPlugin = createAlignmentPlugin();
const focusPlugin = createFocusPlugin();
const decorator = composeDecorators(
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  focusPlugin.decorator
);
const imagePlugin = createImagePlugin({ decorator });

const { AlignmentTool } = alignmentPlugin;
const plugins = [imagePlugin, alignmentPlugin, resizeablePlugin, focusPlugin];

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
    };
  }

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(
      this.state.editorState,
      command
    );
    if (newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  onURLChange = (e) => this.setState({ urlValue: e.target.value });

  focus = () => this.refs.editor.focus();

  onAddImage = (base64) => {
    //e.preventDefault();
    const editorState = this.state.editorState;
    //const urlValue = window.prompt("Paste Image Link");
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "image",
      "IMMUTABLE",
      { src: base64 }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity },
      "create-entity"
    );
    this.setState(
      {
        editorState: AtomicBlockUtils.insertAtomicBlock(
          newEditorState,
          entityKey,
          " "
        ),
      },
      () => {
        setTimeout(() => this.focus(), 0);
      }
    );
  };

  onAddImageClick = (e) => {
    e.preventDefault();
    const editorState = this.state.editorState;
    const urlValue = window.prompt("Paste Image Link");
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "image",
      "IMMUTABLE",
      { src: urlValue }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity },
      "create-entity"
    );
    this.setState(
      {
        editorState: AtomicBlockUtils.insertAtomicBlock(
          newEditorState,
          entityKey,
          " "
        ),
      },
      () => {
        setTimeout(() => this.focus(), 0);
      }
    );
  };

  handleClick = async (event) => {
    const file = event.target.files[0];
    const size = event.target.files[0].size;
    const toBase64 = (file, type, size) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = (error) => reject(error);
      });

    const base64 = await toBase64(file, size);
    await this.onAddImage(base64);
  };

  onUnderlineClick = () => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, "UNDERLINE")
    );
  };

  onBoldClick = () => {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, "BOLD"));
  };

  onItalicClick = () => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, "ITALIC")
    );
  };

  render() {
    return (
      <div className="editorContainer">
        <div className="menuButtons">
          <button onClick={this.onUnderlineClick}>U</button>
          <button onClick={this.onBoldClick}>
            <b>B</b>
          </button>
          <button onClick={this.onItalicClick}>
            <em>I</em>
          </button>
          <button className="inline styleButton" onClick={this.onAddImageClick}>
            <i
              className="material-icons"
              style={{
                fontSize: "16px",
                textAlign: "center",
                padding: "0px",
                margin: "0px",
              }}
            >
              image
            </i>
          </button>

          <input type="file" onChange={this.handleClick} />
        </div>
        <div className="editors">
          <Editor
            blockRendererFn={mediaBlockRenderer}
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            plugins={plugins}
            ref="editor"
          />
          <AlignmentTool />
        </div>
      </div>
    );
  }
}

export default Container;
