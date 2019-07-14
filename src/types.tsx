import * as BaseActions from './BaseActions';

export type CommonAction = BaseActions.Action;

export type NavigationState = {
  /**
   * Unique key for the navigation state.
   */
  key: string;
  /**
   * Index of the currently focused route.
   */
  index: number;
  /**
   * List if valid route names as defined in the screen components.
   */
  routeNames: string[];
  /**
   * List of rendered routes.
   */
  routes: Array<Route & { state?: NavigationState }>;
};

export type InitialState = Omit<Omit<NavigationState, 'routeNames'>, 'key'> & {
  key?: undefined;
  routeNames?: undefined;
  state?: InitialState;
};

export type Route<RouteName = string> = {
  /**
   * Unique key for the route.
   */
  key: string;
  /**
   * User-provided name for the route.
   */
  name: RouteName;
  /**
   * Params for the route.
   */
  params?: object | void;
};

export type NavigationAction = {
  type: string;
};

export type ActionCreators<Action extends NavigationAction = CommonAction> = {
  [key: string]: (...args: any) => Action;
};

export type Router<Action extends NavigationAction = CommonAction> = {
  /**
   * Initialize full navigation state with a given partial state.
   */
  getInitialState(options: {
    screens: { [key: string]: ScreenProps };
    partialState?: NavigationState | InitialState;
    initialRouteName?: string;
  }): NavigationState;

  /**
   * Take the current state and action, and return a new state.
   * If the action cannot be handled, return `null`.
   */
  getStateForAction(
    state: NavigationState,
    action: Action
  ): NavigationState | null;

  /**
   * Action creators for the router.
   */
  actionCreators: ActionCreators<Action>;
};

export type ParamListBase = { [key: string]: object | void };

class PrivateValueStore<T> {
  /**
   * TypeScript requires a type to be actually used to be able to infer it.
   * This is a hacky way of storing type in a property without surfacing it in intellisense.
   */
  // @ts-ignore
  private __private_value_type?: T;
}

export type NavigationHelpers<
  ParamList extends ParamListBase = ParamListBase
> = {
  /**
   * Dispatch an action or an update function to the router.
   * The update function will receive the current state,
   */
  dispatch(
    action: NavigationAction | ((state: NavigationState) => NavigationState)
  ): void;

  /**
   * Navigate to a route in current navigation tree.
   *
   * @param name Name of the route to navigate to.
   * @param [params] Params object for the route.
   */
  navigate<RouteName extends keyof ParamList>(
    ...args: ParamList[RouteName] extends void
      ? [RouteName]
      : [RouteName, ParamList[RouteName]]
  ): void;

  /**
   * Replace the current route with a new one.
   *
   * @param name Route name of the new route.
   * @param [params] Params object for the new route.
   */
  replace<RouteName extends keyof ParamList>(
    ...args: ParamList[RouteName] extends void
      ? [RouteName]
      : [RouteName, ParamList[RouteName]]
  ): void;

  /**
   * Reset the navigation state to the provided state.
   * If a key is provided, the state with matching key will be reset.
   */
  reset(state: InitialState & { key?: string }): void;

  /**
   * Go back to the previous route in history.
   */
  goBack(): void;
} & PrivateValueStore<ParamList>;

export type NavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList
> = NavigationHelpers<ParamList> & {
  /**
   * State for the child navigator.
   */
  state: Route<RouteName> &
    (ParamList[RouteName] extends void
      ? never
      : { params: ParamList[RouteName] });

  /**
   * Update the param object for the route.
   * The new params will be shallow merged with the old one.
   */
  setParams(params: ParamList[RouteName]): void;
};

export type CompositeNavigationProp<
  A extends NavigationHelpers<ParamListBase>,
  B extends NavigationHelpers<ParamListBase>
> = Omit<A & B, keyof NavigationHelpers<any>> &
  NavigationHelpers<
    (A extends NavigationHelpers<infer T> ? T : never) &
      (B extends NavigationHelpers<infer U> ? U : never)
  >;

export type Descriptor = {
  /**
   * Render the component associated with this route.
   */
  render(): JSX.Element;

  /**
   * Options for the route.
   */
  options: Options;
};

export type Options = {
  /**
   * Title text for the screen.
   */
  title?: string;

  [key: string]: any;
};

export type ScreenProps<
  ParamList extends ParamListBase = ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  /**
   * Route name of this screen.
   */
  name: RouteName;

  /**
   * Navigator options for this screen.
   */
  options?: Options;

  /**
   * Initial params object for the route.
   */
  initialParams?: ParamList[RouteName];
} & (
  | {
      /**
       * React component to render for this screen.
       */
      component: React.ComponentType<any>;
    }
  | {
      /**
       * Render callback to render content of this screen.
       */
      children: (props: any) => React.ReactNode;
    });

export type TypedNavigator<
  ParamList extends ParamListBase,
  Navigator extends React.ComponentType<any>
> = {
  Navigator: React.ComponentType<
    React.ComponentProps<Navigator> & {
      /**
       * Route to focus on initial render.
       */
      initialRouteName?: keyof ParamList;
    }
  >;
  Screen: React.ComponentType<ScreenProps<ParamList, keyof ParamList>>;
};