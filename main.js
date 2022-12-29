{
	//The Slide class
	class Slide {
		constructor(el, settings) {
			this.DOM = { el: el };

			this.settings = {
				detailsEl: null,
				onHideDetails: () => {
					return false;
				}
			};
			Object.assign(this.settings, settings);

			this.DOM.wrap = this.DOM.el.querySelector(".slide__wrap");

			this.DOM.img = this.DOM.wrap.querySelector(".slide__img");

			this.DOM.titleWrap = this.DOM.wrap.querySelector(".slide__title-wrap");

			this.DOM.detailsItems = Array.from(
				this.settings.detailsEl.querySelectorAll(".details__item")
			);
			this.totalDetailItems = this.DOM.detailsItems.length;

			this.DOM.hideDetailsCtrl = this.DOM.detailsItems.filter((item) =>
				item.classList.contains("details__item--close")
			)[0];
			this.DOM.hideDetailsCtrl.addEventListener("click", () =>
				this.settings.onHideDetails()
			);

			this.config = {
				animation: {
					duration: 1.2,
					ease: Expo.easeInOut
				}
			};
		}

		setCurrent(isCurrent = true) {
			this.DOM.el.classList[isCurrent ? "add" : "remove"]("slide--current");
		}

		hide(direction) {
			return this.toggle("hide", direction);
		}

		show(direction) {
			this.DOM.el.style.zIndex = 1000;
			return this.toggle("show", direction);
		}

		toggle(action, direction) {
			return new Promise((resolve, reject) => {
				if (action === "show") {
					TweenMax.to(this.DOM.wrap, this.config.animation.duration, {
						ease: this.config.animation.ease,
						startAt: { x: direction === "right" ? "100%" : "-100%" },
						x: "0%"
					});
					TweenMax.to(this.DOM.titleWrap, this.config.animation.duration, {
						ease: this.config.animation.ease,
						startAt: { x: direction === "right" ? "-100%" : "100%" },
						x: "0%"
					});
				}

				TweenMax.to(this.DOM.img, this.config.animation.duration, {
					ease: this.config.animation.ease,
					startAt:
						action === "hide"
							? {}
							: { x: direction === "right" ? "-100%" : "100%", scale: 1.1 },
					x: "0%",
					scale: action === "hide" ? 1.1 : 1,
					onStart: () => {
						this.DOM.img.style.transformOrigin =
							action === "hide"
								? direction === "right"
									? "100% 50%"
									: "0% 50%"
								: direction === "right"
								? "0% 50%"
								: "100% 50%";
						this.DOM.el.style.opacity = 1;
					},
					onComplete: () => {
						this.DOM.el.style.zIndex = 999;
						this.DOM.el.style.opacity = action === "hide" ? 0 : 1;
						resolve();
					}
				});
			});
		}

		// Show the details boxes.
		showDetails() {
			return new Promise((resolve, reject) => {
				if (this.isDetailsOpen) {
					resolve();
					return false;
				}

				const processItem = (item, pos) => {
					return new Promise((resolve, reject) => {
						const duration = pos >= this.totalDetailItems - 3 ? 0.7 : 0.2;
						const ease =
							pos >= this.totalDetailItems - 3 ? "Expo.easeOut" : "Power2.easeInOut";

						const delay = pos * 0.08;
						// The direction to animate the box. We can specify this as a data attribute otherwise we assume a default of rtl ("right to left")
						// right to left (rtl) | left to right (ltr) | bottom to top (btt) | top to bottom (ttb).
						const direction = item.dataset.direction || "rtl";

						let itemAnimOpts = {
							ease: ease,
							delay: delay,
							x: "0%",
							y: "0%"
						};

						let innerAnimOpts = {
							ease: ease,
							delay: delay,
							x: "0%",
							y: "0%",
							onComplete: resolve
						};

						if (direction === "rtl" || direction === "ltr") {
							itemAnimOpts.startAt =
								direction === "rtl" ? { x: "100%", y: "0%" } : { x: "-100%", y: "0%" };
							innerAnimOpts.startAt =
								direction === "rtl" ? { x: "-100%", y: "0%" } : { x: "100%", y: "0%" };
						} else {
							itemAnimOpts.startAt =
								direction === "btt" ? { x: "0%", y: "100%" } : { x: "0%", y: "-100%" };
							innerAnimOpts.startAt =
								direction === "btt" ? { x: "0%", y: "-100%" } : { x: "0%", y: "100%" };
						}

						TweenMax.to(item, duration, itemAnimOpts);
						TweenMax.to(
							item.querySelector(".details__inner"),
							duration,
							innerAnimOpts
						);
					});
				};

				let processing = [];
				this.DOM.detailsItems.forEach((item, pos) =>
					processing.push(processItem(item, pos))
				);
				Promise.all(processing).then(() => {
					this.isDetailsOpen = true;
					resolve();
				});
			});
		}
		hideDetails() {
			return new Promise((resolve, reject) => {
				if (!this.isDetailsOpen) {
					resolve();
					return false;
				}

				const processItem = (item, pos) => {
					return new Promise((resolve, reject) => {
						const duration = pos === 0 ? 0.7 : 0.2;
						const ease = pos === 0 ? "Expo.easeOut" : "Power2.easeInOut";
						const delay = (this.totalDetailItems - pos - 1) * 0.08;
						const direction = item.dataset.direction || "rtl"; // right to left (rtl) | left to right (ltr) | bottom to top (btt) | top to bottom (ttb).

						let itemAnimOpts = {
							ease: ease,
							delay: delay
						};

						let innerAnimOpts = {
							ease: ease,
							delay: delay,
							onComplete: resolve
						};

						if (direction === "rtl" || direction === "ltr") {
							itemAnimOpts.x = direction === "rtl" ? "100%" : "-100%";
							itemAnimOpts.y = "0%";
							innerAnimOpts.x = direction === "rtl" ? "-100%" : "100%";
							innerAnimOpts.y = "0%";
						} else {
							itemAnimOpts.y = direction === "btt" ? "100%" : "-100%";
							itemAnimOpts.x = "0%";
							innerAnimOpts.y = direction === "btt" ? "-100%" : "100%";
							innerAnimOpts.x = "0%";
						}

						TweenMax.to(item, duration, itemAnimOpts);
						TweenMax.to(
							item.querySelector(".details__inner"),
							duration,
							innerAnimOpts
						);
					});
				};

				let processing = [];
				this.DOM.detailsItems.forEach((item, pos) =>
					processing.push(processItem(item, pos))
				);
				Promise.all(processing).then(() => {
					this.isDetailsOpen = false;
					resolve();
				});
			});
		}
	}

	class Navigation {
		constructor(el, settings) {
			this.DOM = { el: el };

			this.settings = {
				next: () => {
					return false;
				},
				prev: () => {
					return false;
				}
			};
			Object.assign(this.settings, settings);

			// Navigation controls (prev and next)
			this.DOM.prevCtrl = this.DOM.el.querySelector(".boxnav__item--prev");
			this.DOM.nextCtrl = this.DOM.el.querySelector(".boxnav__item--next");
			// The current and total pages elements.
			this.DOM.pagination = {
				current: this.DOM.el.querySelector(".boxnav__label--current"),
				total: this.DOM.el.querySelector(".boxnav__label--total")
			};
			this.initEvents();
		}

		setCurrent(val, direction) {
			//this.DOM.pagination.current.innerHTML = val;
			TweenMax.to(this.DOM.pagination.current, 0.4, {
				ease: "Back.easeIn",
				y: direction === "right" ? "-100%" : "100%",
				opacity: 0,
				onComplete: () => {
					this.DOM.pagination.current.innerHTML = val;
					TweenMax.to(this.DOM.pagination.current, 0.8, {
						ease: "Expo.easeOut",
						startAt: { y: direction === "right" ? "50%" : "-50%", opacity: 0 },
						y: "0%",
						opacity: 1
					});
				}
			});
		}

		setTotal(val) {
			this.DOM.pagination.total.innerHTML = val;
		}

		initEvents() {
			this.DOM.prevCtrl.addEventListener("click", () => this.settings.prev());
			this.DOM.nextCtrl.addEventListener("click", () => this.settings.next());
		}
	}

	// The Slideshow class.
	class Slideshow {
		constructor(el) {
			this.DOM = { el: el };

			this.navigation = new Navigation(document.querySelector(".boxnav"), {
				next: () => this.navigate("right"),
				prev: () => this.navigate("left")
			});

			this.DOM.detailsCtrl = document.querySelector(".action--details");

			this.DOM.detailsWrap = document.querySelector(".details-wrap");

			this.DOM.details = Array.from(
				this.DOM.detailsWrap.querySelectorAll(".details")
			);

			this.slides = [];

			Array.from(this.DOM.el.querySelectorAll(".slide")).forEach((slideEl, pos) =>
				this.slides.push(
					new Slide(slideEl, {
						detailsEl: this.DOM.details[pos],

						onHideDetails: () => {
							if (this.isAnimating) return;
							this.isAnimating = true;
							this.closeDetailsBoxes().then(() => (this.isAnimating = false));
						}
					})
				)
			);

			this.slidesTotal = this.slides.length;

			this.navigation.setTotal(this.slidesTotal);
			// At least 2 slides to continue...
			if (this.slidesTotal < 2) {
				return false;
			}

			this.current = 0;

			this.init();
		}
		// Set the current slide and initialize some events.
		init() {
			this.slides[this.current].setCurrent();
			this.initEvents();
		}
		initEvents() {
			// Open the details boxes.
			this.DOM.detailsCtrl.addEventListener("click", () =>
				this.openDetailsBoxes()
			);
		}
		openDetailsBoxes() {
			if (this.isAnimating) return;
			this.isAnimating = true;

			this.DOM.el.classList.add("slideshow--details");

			this.DOM.detailsWrap.classList.add("details-wrap--open");
			this.DOM.details[this.current].classList.add("details--current");
			this.slides[this.current]
				.showDetails()
				.then(() => (this.isAnimating = false));
		}
		closeDetailsBoxes() {
			return new Promise((resolve, reject) => {
				// Overlay.
				this.DOM.el.classList.remove("slideshow--details");
				this.slides[this.current].hideDetails().then(() => {
					this.DOM.details[this.current].classList.remove("details--current");
					this.DOM.detailsWrap.classList.remove("details-wrap--open");
					resolve();
				});
			});
		}
		// Navigate the slideshow.
		navigate(direction) {
			if (this.isAnimating) return;
			this.isAnimating = true;

			// The next/prev slide´s position.
			const nextSlidePos =
				direction === "right"
					? this.current < this.slidesTotal - 1
						? this.current + 1
						: 0
					: this.current > 0
					? this.current - 1
					: this.slidesTotal - 1;

			this.closeDetailsBoxes().then(() => {
				// Update the current page element.
				this.navigation.setCurrent(nextSlidePos + 1, direction);

				Promise.all([
					this.slides[this.current].hide(direction),
					this.slides[nextSlidePos].show(direction)
				]).then(() => {
					// Update current.
					this.slides[this.current].setCurrent(false);
					this.current = nextSlidePos;
					this.slides[this.current].setCurrent();
					this.isAnimating = false;
				});
			});
		}
	}

	// Initialize the slideshow
	const slideshow = new Slideshow(document.querySelector(".slideshow"));
	// Preload all the images..
	imagesLoaded(
		document.querySelectorAll(".slide__img"),
		{ background: true },
		() => document.body.classList.remove("loading")
	);
}
