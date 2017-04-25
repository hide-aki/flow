import React from 'react';
import { Link, hashHistory, withRouter } from 'react-router';
import WorkspacesIndex from './workspaces_index';
import CreateWorkspaceForm from './create_workspace'

class Workspace extends React.Component {
	constructor(props) {
    super(props);
		this.state = { dropdownOn: false, createWorkspaceOn: false };

		this._logOutAndClearState = this._logOutAndClearState.bind(this);
		this._renderDropdown = this._renderDropdown.bind(this);
		this.toggleCreateWorkspace = this.toggleCreateWorkspace.bind(this);
		this.toggleDropdown = this.toggleDropdown.bind(this);
  }

	componentDidMount(){
		if (this.props.loggedIn) {
			this.props.fetchAllWorkspaces();
			this.props.fetchInitialWorkspace()
			.then((action) => (hashHistory.push(`/${action.workspace.id}`)));
		}
	}

	_logOutAndClearState() {
    if (this.props.loggedIn) {
      this.props.receiveAllWorkspaces({});
      this.props.receiveWorkspace("");
      this.props.receiveErrors([]);
      this.props.logout()
    }
  }

	_getInitials() {
		const first_initial = this.props.currentUser.first_name.slice(0,1);
		const second_initial = this.props.currentUser.last_name.slice(0,1);
		return first_initial.concat(second_initial);
	}

	_renderDropdown() {
		if (this.state.dropdownOn){
			return(
				<div onClick={this.toggleDropdown} className="dropdown">
					<section className="dropdown-workspaces">
						<h2>workspaces</h2>
						<WorkspacesIndex workspacesList={this.props.workspacesList} />
						<h3 onClick={this.toggleCreateWorkspace} to={'/'}>+ Create new Workspace</h3>
					</section>

					<h2 onClick={this._logOutAndClearState}>Sign Out</h2>
				</div>
			)
		} else {
			return null;
		}
	}

	toggleDropdown() {
		if (this.state.dropdownOn) {
			this.setState({ dropdownOn: false })
		} else {
			this.setState({ dropdownOn: true })
		}
	}

	toggleCreateWorkspace() {
		if (this.state.createWorkspaceOn) {
			this.setState({ createWorkspaceOn: false })
		} else {
			this.setState({ createWorkspaceOn: true })
		}
	}


  render() {
		if (this.props.currentWorkspace) {
			const currentWorkspace = this.props.currentWorkspace
			const workspaceTitle = this.props.workspacesList[currentWorkspace].title;
			return(
				<div onClick={this.resetDropdown} className="app-workspaces">
					<nav className="side-bar">
					</nav>

					<content className='workspaces'>
						<nav className="workspaces-header group">
							<ul className="workspaces-header-left group">
								<li>my tasks</li>
							</ul>
							<ul onClick={this.toggleDropdown} className="workspaces-header-right group">
								<div className="badge">{this._getInitials()}</div>
								<li>{`${workspaceTitle}`}</li>
							</ul>
						</nav>
						{this._renderDropdown()}
					</content>

					<CreateWorkspaceForm
						toggleCreateWorkspace={this.toggleCreateWorkspace}
						formOpen={this.state.createWorkspaceOn}
						createWorkspace={this.props.createWorkspace}
						receiveErrors={this.props.receiveErrors}
						errors={this.props.errors} />
				</div>
			);
		} else {
			return null
		}
  }
}

export default withRouter(Workspace);
