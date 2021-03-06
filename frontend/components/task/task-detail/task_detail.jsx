import React from 'react';
import { withRouter, hashHistory, Link } from 'react-router';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import FlatButton from 'material-ui/FlatButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import TeamDropDown from './task_detail_dropdown';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import CommentIndexContainer from '../../comment/comment_index_container';
import CommentSubmitForm from '../../comment/comment_submit_form';
import {
  deepPurple200,
  deepPurple500,
  lightRed200,
  grey50,
  grey600,
  deepPurple50,
  red500,
  blue500,
  redA400,
  pink400
} from 'material-ui/styles/colors';

class TaskDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.currentTask;
    this.handleChange = this.handleChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleComplete = this.handleComplete.bind(this);
  }

  handleChange(field) {
    return (e) => {
      this.setState({ [field]: e.target.value });
    };
  }

  componentDidMount() {
    this.props.fetchCurrentTask(this.props.params.taskId)
      .then(action => this.setState(action.task));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.taskId !== this.props.params.taskId) {
      this.props.fetchCurrentTask(nextProps.params.taskId)
        .then(action => this.setState(action.task));
    }

    if (
        nextProps.currentTask.title !== this.props.currentTask.title ||
        nextProps.currentTask.completed !== this.props.currentTask.completed ||
        nextProps.currentTask.assignee_id !== this.props.currentTask.assignee_id
      ) {
        this.setState(nextProps.currentTask);
    }
  }

  componentWillUnmount() {
    this.props.updateTask(this.state);
  }

  handleDateChange(e, date) {
    const dateStr = date.toISOString().slice(0,10).concat(" 20:00:00");
    const task = Object.assign({}, this.state, { due_date: dateStr });
    this.setState({ due_date: dateStr });
    this.props.updateTask(task);
  }

  handleDelete() {
    this.props.deleteTask(this.state.id);
    this.props.router.push("/" + this.props.params.workspaceId + "/"
                            + this.props.params.projectId + "/" + "tasks");
  }

  handleComplete() {
    if (!this.state.completed) {
      const dateClosed = new Date();
      const date = dateClosed.toISOString().slice(0,10);
      const time = dateClosed.toISOString().slice(11,19);
      const dateStr = date.concat(` ${time}`);
      const task = Object.assign({}, this.state, { completed_at: dateStr, completed: !this.state.completed });
      this.props.updateTask(task)
        .then(() => { this.props.fetchCurrentTask(this.state.id)
          .then(action => { this.setState(action.task); });
         });
    } else {
      const task = Object.assign({}, this.state, { completed_at: null, completed: !this.state.completed });
      this.props.updateTask(task)
        .then(() => { this.props.fetchCurrentTask(this.state.id)
          .then(action => { this.setState(action.task); });
         });
    }
  }

  renderHeader() {
    let date = {};

    if (this.state.due_date) {
      date = new Date(this.state.due_date);
    }

    const buttonStyle = {
      marginTop: 5,
      minWidth: '9px',
      marginLeft: '20px',
    };

    const dateStyle = {
      width: '100px',
      marginLeft: 15,
      textAlign: 'Center',
    };

    return(
      <section className="task-detail-header">
        <section className = "task-detail-header-set">
          <TeamDropDown
            task={this.state}
            membersList={this.props.membersList}
            fetchCurrentTask={this.props.fetchCurrentTask}
            updateTask={this.props.updateTask} />
          <DatePicker
            value={date}
            onChange={this.handleDateChange}
            container="inline"
            mode="landscape"
            hintText="Due Date"
            autoOk={true}
            firstDayOfWeek={0}
            textFieldStyle={ dateStyle }>
          </DatePicker>
        </section>
        <section className = "task-detail-header-close">
          <FlatButton
            icon={<ActionDelete />}
            onTouchTap={this.handleDelete}
            style={ buttonStyle }
          />
          <FlatButton
            icon={<NavigationClose />}
            onTouchTap={ () => { this.props.router.push("/"
            + this.props.params.workspaceId + "/" + this.props.params.projectId
            + "/" + "tasks");}}
            style={ buttonStyle }
          />
          </section>
      </section>
      );
  }

  renderTitle() {
    let className, buttonClassName;
    if (this.state.completed) {
      className = 'completed-task-input';
      buttonClassName = 'completed-task-detail-check';
    } else {
      className = 'task-input';
      buttonClassName = 'task-detail-check';
    }

    return(
      <section className="task-detail-title">
        <button
          onClick={this.handleComplete}
          className={buttonClassName}>
        </button>
        <TextField
          id={`${this.state.id}`}
          hintText="Title"
          value={this.state.title}
          onChange={this.handleChange('title')}
          multiLine={false}
          underlineShow={true}
          style={titleStyle}
          inputStyle ={{width: '100%'}}
          onBlur={() => { this.props.updateTask(this.state); }} />
      </section>
      );
  }

  renderDescription() {
    let description = '';
    if (this.state.description) {
      description = this.state.description;
    }

    return(
      <div className='task-detail-description'>
        <TextField
          id={`${this.state.title}`}
          hintText="Description"
          value={description}
          onChange={this.handleChange('description')}
          multiLine={true}
          underlineShow={true}
          rows={7}
          rowsMax={7}
          fullWidth={true}
          style={descriptionStyle}
          onBlur={() => { this.props.updateTask(this.state); }}/>
      </div>
    );
  }

  renderDateCreated() {
    if (this.state.author_id) {
      const authorFirstName = this.props.membersList[this.state.author_id].first_name;
      const authorLastName = this.props.membersList[this.state.author_id].last_name;
      const authorFullName = authorFirstName.concat(' ').concat(authorLastName);
      const dateCreated = new Date(this.state.created_at);
      const date = dateCreated.toLocaleDateString();
      const time = dateCreated.toLocaleTimeString();

      return(
        <p>{`Created by ${authorFullName} on ${date} at ${time}`}</p>
      );
    } else {
      return null;
    }
  }

  renderDateClosed() {
    if (this.state.completed_at) {
      const dateClosed = new Date(this.state.completed_at);
      const date = dateClosed.toLocaleDateString();
      const time = dateClosed.toLocaleTimeString();

      return(
        <p>{`Closed on ${date} at ${time}`}</p>
      );
    } else {
      return null;
    }
  }

  renderUpdatedDate() {
    if (this.state.updated_at) {
      const dateClosed = new Date(this.state.updated_at);
      const date = dateClosed.toLocaleDateString();
      const time = dateClosed.toLocaleTimeString();

      return(
        <p>{`Updated on ${date} at ${time}`}</p>
      );
    } else {
      return null;
    }
  }

  renderDates() {
    return(
      <div className="task-detail-dates">
        {this.renderDateCreated()}
        {this.renderUpdatedDate()}
        {this.renderDateClosed()}
      </div>
    );
  }

  render() {
    if (this.state) {
      return(
        <div className="task-detail">
          <section className="task-detail-top">
            {this.renderHeader()}
            {this.renderTitle()}
            {this.renderDescription()}
            {this.renderDates()}
            <CommentIndexContainer />
          </section>
          <section className="task-detail-footor">
            <CommentSubmitForm
              taskId={this.state.id}
              createComment={this.props.createComment}
            />
          </section>
        </div>
      );
    } else {
      return null;
    }
  }
}

const titleStyle = {
  display: 'inline-block',
  paddingLeft: '0px',
  fontSize: '1.25em',
  fontWeight: 600,
  height: '50px',
  paddingBottom: '3px',
  width: '95%'
};

const descriptionStyle = {
  display: 'inline-block',
  paddingLeft: '0px',
  fontSize: '1em',
  height: '180px',
  paddingBottom: '3px',
  width: '100%'
};
export default withRouter(TaskDetail);
