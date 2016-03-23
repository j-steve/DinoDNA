import React, { Component, PropTypes} from 'react';

/**
 * Base App component
 */
class Dino extends Component {

		/**
		 * @constructor
		 * @param  {Object} props The props passed to this component
		 */
		constructor(props) {
			super(props);

			// set the initial component state
			this.state = {
				something: false
			};
		}

		/**
		 * Dummy click handler just for reference. Syntax requires
		 * the babel 'transform-class-properties' plugin to enable
		 * Class Fields, a potential ES7 feature:
		 *
		 * https://github.com/jeffmo/es-class-fields-and-static-properties
		 * 
		 */
		onClick = (e) => {
			e.preventDefault();

			// arrow functions maintain the `this` context from their parent scope
			// (otherwise we would have to bind)
			this.setState({something: !this.state.something});
		}

		render() {
			const { title } = this.props;

			return (
				<section>
					<h1>{title}</h1>
					<p>Welcomeee to {title}</p>

					<form action="/file-upload" className="dropzone" encType="multipart/form-data" method="post"></form>
				</section>
			);
		}
}


Dino.propTypes = {
	title: PropTypes.string
};

Dino.defaultProps = {
	title: 'DinoDNA'
};

export default Dino;
